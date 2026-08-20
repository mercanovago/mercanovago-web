import {
  NextRequest,
  NextResponse,
} from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const READ_ROLES = new Set([
  "super_admin",
  "admin",
  "order_manager",
  "support",
]);

const WRITE_ROLES = new Set([
  "super_admin",
  "admin",
  "order_manager",
]);

const DELIVERY_ASSIGNMENT_STATUSES = [
  "Asignado",
  "Aceptado",
  "Preparando retiro",
  "Pedido retirado",
  "En ruta",
  "Entregado",
  "Cancelado",
] as const;

type DeliveryAssignmentStatus =
  (typeof DELIVERY_ASSIGNMENT_STATUSES)[number];

const ACTIVE_STATUSES: DeliveryAssignmentStatus[] = [
  "Asignado",
  "Aceptado",
  "Preparando retiro",
  "Pedido retirado",
  "En ruta",
];

const ASSIGNMENT_SELECT = `
  id,
  order_id,
  driver_id,
  status,
  assigned_at,
  accepted_at,
  preparation_completed_at,
  picked_up_at,
  started_at,
  delivered_at,
  cancelled_at,
  estimated_arrival_at,
  origin_address,
  destination_address,
  origin_latitude,
  origin_longitude,
  destination_latitude,
  destination_longitude,
  distance_km,
  estimated_duration_minutes,
  assignment_notes,
  delivery_notes,
  cancellation_reason,
  proof_of_delivery_url,
  created_at,
  updated_at
`;

const ASSIGNMENT_WITH_RELATIONS_SELECT = `
  ${ASSIGNMENT_SELECT},
  delivery_drivers (
    id,
    first_name,
    last_name,
    phone,
    email,
    vehicle_type,
    vehicle_brand,
    vehicle_model,
    vehicle_color,
    vehicle_plate,
    status,
    active
  ),
  orders (
    id,
    customer_id,
    status,
    delivery_status,
    delivery_type,
    delivery_date,
    delivery_time,
    delivery_window,
    estimated_delivery,
    delivery_notes,
    total,
    created_at
  )
`;

interface AuthorizedAdmin {
  userId: string;
  role: string;
}

function cleanOptionalText(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const clean = value.trim();

  return clean || null;
}

function toNullableNumber(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const converted =
    Number(value);

  return Number.isFinite(converted)
    ? converted
    : null;
}

function positiveId(
  value: unknown
): number | null {
  const id = Number(value);

  return Number.isInteger(id) &&
    id > 0
    ? id
    : null;
}

function getBearerToken(
  request: NextRequest
): string | null {
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (!authorization) {
    return null;
  }

  const [scheme, token] =
    authorization.split(" ");

  if (
    scheme?.toLowerCase() !==
      "bearer" ||
    !token?.trim()
  ) {
    return null;
  }

  return token.trim();
}

async function authorize(
  request: NextRequest,
  write = false
): Promise<
  | {
      ok: true;
      admin: AuthorizedAdmin;
    }
  | {
      ok: false;
      response: NextResponse;
    }
> {
  const token =
    getBearerToken(request);

  if (!token) {
    return {
      ok: false,
      response:
        NextResponse.json(
          {
            ok: false,
            error:
              "No autorizado.",
          },
          { status: 401 }
        ),
    };
  }

  const {
    data: { user },
    error: userError,
  } =
    await supabaseAdmin.auth.getUser(
      token
    );

  if (
    userError ||
    !user
  ) {
    return {
      ok: false,
      response:
        NextResponse.json(
          {
            ok: false,
            error:
              "Sesión administrativa inválida.",
          },
          { status: 401 }
        ),
    };
  }

  const {
    data: profile,
    error: profileError,
  } = await supabaseAdmin
    .from("admin_profiles")
    .select(`
      user_id,
      role,
      active,
      locked_until
    `)
    .eq(
      "user_id",
      user.id
    )
    .maybeSingle();

  if (profileError) {
    console.error(
      "Error validando administrador Delivery:",
      profileError
    );

    return {
      ok: false,
      response:
        NextResponse.json(
          {
            ok: false,
            error:
              "No fue posible validar la autorización administrativa.",
          },
          { status: 500 }
        ),
    };
  }

  if (
    !profile ||
    profile.active !== true
  ) {
    return {
      ok: false,
      response:
        NextResponse.json(
          {
            ok: false,
            error:
              "Usuario sin autorización administrativa.",
          },
          { status: 403 }
        ),
    };
  }

  if (
    profile.locked_until &&
    new Date(
      profile.locked_until
    ).getTime() >
      Date.now()
  ) {
    return {
      ok: false,
      response:
        NextResponse.json(
          {
            ok: false,
            error:
              "La cuenta administrativa se encuentra bloqueada.",
          },
          { status: 403 }
        ),
    };
  }

  const allowedRoles =
    write
      ? WRITE_ROLES
      : READ_ROLES;

  if (
    !allowedRoles.has(
      profile.role
    )
  ) {
    return {
      ok: false,
      response:
        NextResponse.json(
          {
            ok: false,
            error:
              "El rol administrativo no tiene permisos para esta operación Delivery.",
          },
          { status: 403 }
        ),
    };
  }

  return {
    ok: true,
    admin: {
      userId: user.id,
      role: profile.role,
    },
  };
}

function databaseErrorMessage(
  error: {
    code?: string;
    message?: string;
    details?: string;
  },
  fallback: string
): string {
  const text = `${
    error.message ?? ""
  } ${
    error.details ?? ""
  }`.toLowerCase();

  if (error.code === "23505") {
    if (
      text.includes(
        "order_id"
      )
    ) {
      return "Este pedido ya tiene una asignación de entrega activa.";
    }

    if (
      text.includes(
        "driver_id"
      )
    ) {
      return "Este repartidor ya tiene una entrega activa.";
    }
  }

  if (error.code === "23503") {
    return "El pedido o repartidor seleccionado ya no existe.";
  }

  return (
    error.message ||
    fallback
  );
}

async function getById(
  id: number
) {
  const {
    data,
    error,
  } = await supabaseAdmin
    .from(
      "delivery_assignments"
    )
    .select(
      ASSIGNMENT_WITH_RELATIONS_SELECT
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      databaseErrorMessage(
        error,
        "No fue posible cargar la asignación."
      )
    );
  }

  return data;
}

async function getActiveByOrder(
  orderId: number
) {
  const {
    data,
    error,
  } = await supabaseAdmin
    .from(
      "delivery_assignments"
    )
    .select(
      ASSIGNMENT_WITH_RELATIONS_SELECT
    )
    .eq(
      "order_id",
      orderId
    )
    .in(
      "status",
      ACTIVE_STATUSES
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      databaseErrorMessage(
        error,
        "No fue posible verificar la asignación activa del pedido."
      )
    );
  }

  return data;
}

async function getActiveByDriver(
  driverId: number
) {
  const {
    data,
    error,
  } = await supabaseAdmin
    .from(
      "delivery_assignments"
    )
    .select(
      ASSIGNMENT_WITH_RELATIONS_SELECT
    )
    .eq(
      "driver_id",
      driverId
    )
    .in(
      "status",
      ACTIVE_STATUSES
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      databaseErrorMessage(
        error,
        "No fue posible verificar la disponibilidad del repartidor."
      )
    );
  }

  return data;
}

export async function GET(
  request: NextRequest
) {
  try {
    const auth =
      await authorize(
        request,
        false
      );

    if (!auth.ok) {
      return auth.response;
    }

    const params =
      request.nextUrl
        .searchParams;

    const scope =
      params.get("scope") ??
      "active";

    if (
      scope === "all" ||
      scope === "active"
    ) {
      let query =
        supabaseAdmin
          .from(
            "delivery_assignments"
          )
          .select(
            ASSIGNMENT_WITH_RELATIONS_SELECT
          );

      if (
        scope === "active"
      ) {
        query =
          query.in(
            "status",
            ACTIVE_STATUSES
          );
      }

      const {
        data,
        error,
      } = await query.order(
        "assigned_at",
        {
          ascending: false,
        }
      );

      if (error) {
        throw error;
      }

      return NextResponse.json({
        ok: true,
        data: data ?? [],
      });
    }

    if (scope === "id") {
      const id =
        positiveId(
          params.get("id")
        );

      if (!id) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Identificador de asignación no válido.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        ok: true,
        data:
          await getById(id),
      });
    }

    if (
      scope ===
      "active_order"
    ) {
      const orderId =
        positiveId(
          params.get(
            "orderId"
          )
        );

      if (!orderId) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Identificador de pedido no válido.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        ok: true,
        data:
          await getActiveByOrder(
            orderId
          ),
      });
    }

    if (
      scope ===
      "active_driver"
    ) {
      const driverId =
        positiveId(
          params.get(
            "driverId"
          )
        );

      if (!driverId) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Identificador de repartidor no válido.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        ok: true,
        data:
          await getActiveByDriver(
            driverId
          ),
      });
    }

    if (
      scope ===
        "history_order" ||
      scope ===
        "history_driver"
    ) {
      const field =
        scope ===
        "history_order"
          ? "order_id"
          : "driver_id";

      const queryId =
        positiveId(
          params.get(
            scope ===
              "history_order"
              ? "orderId"
              : "driverId"
          )
        );

      if (!queryId) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Identificador no válido.",
          },
          { status: 400 }
        );
      }

      const {
        data,
        error,
      } = await supabaseAdmin
        .from(
          "delivery_assignments"
        )
        .select(
          ASSIGNMENT_WITH_RELATIONS_SELECT
        )
        .eq(
          field,
          queryId
        )
        .order(
          "assigned_at",
          {
            ascending: false,
          }
        );

      if (error) {
        throw error;
      }

      return NextResponse.json({
        ok: true,
        data: data ?? [],
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          "Consulta Delivery no válida.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "Error consultando asignaciones Delivery:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const auth =
      await authorize(
        request,
        true
      );

    if (!auth.ok) {
      return auth.response;
    }

    const body =
      (await request.json()) as {
        action?: unknown;
        assignment?: Record<
          string,
          unknown
        >;
        assignmentId?: unknown;
        newDriverId?: unknown;
        cancellationReason?: unknown;
        overrides?: Record<
          string,
          unknown
        > | null;
      };

    if (
      body.action ===
      "create"
    ) {
      const assignment =
        body.assignment;

      if (!assignment) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Los datos de asignación son obligatorios.",
          },
          { status: 400 }
        );
      }

      const orderId =
        positiveId(
          assignment.order_id
        );

      const driverId =
        positiveId(
          assignment.driver_id
        );

      if (
        !orderId ||
        !driverId
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Pedido o repartidor no válido.",
          },
          { status: 400 }
        );
      }

      const [
        existingOrder,
        existingDriver,
      ] =
        await Promise.all([
          getActiveByOrder(
            orderId
          ),
          getActiveByDriver(
            driverId
          ),
        ]);

      if (existingOrder) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Este pedido ya tiene una asignación de entrega activa.",
          },
          { status: 409 }
        );
      }

      if (existingDriver) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Este repartidor ya tiene una entrega activa.",
          },
          { status: 409 }
        );
      }

      const payload = {
        order_id: orderId,
        driver_id: driverId,
        status:
          "Asignado",
        origin_address:
          cleanOptionalText(
            assignment.origin_address
          ),
        destination_address:
          cleanOptionalText(
            assignment.destination_address
          ),
        origin_latitude:
          toNullableNumber(
            assignment.origin_latitude
          ),
        origin_longitude:
          toNullableNumber(
            assignment.origin_longitude
          ),
        destination_latitude:
          toNullableNumber(
            assignment.destination_latitude
          ),
        destination_longitude:
          toNullableNumber(
            assignment.destination_longitude
          ),
        distance_km:
          toNullableNumber(
            assignment.distance_km
          ),
        estimated_duration_minutes:
          toNullableNumber(
            assignment.estimated_duration_minutes
          ),
        estimated_arrival_at:
          cleanOptionalText(
            assignment.estimated_arrival_at
          ),
        assignment_notes:
          cleanOptionalText(
            assignment.assignment_notes
          ),
        delivery_notes:
          cleanOptionalText(
            assignment.delivery_notes
          ),
      };

      const {
        data,
        error,
      } = await supabaseAdmin
        .from(
          "delivery_assignments"
        )
        .insert(payload)
        .select(
          ASSIGNMENT_WITH_RELATIONS_SELECT
        )
        .single();

      if (error) {
        return NextResponse.json(
          {
            ok: false,
            error:
              databaseErrorMessage(
                error,
                "No fue posible asignar el pedido al repartidor."
              ),
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        data,
      });
    }

    if (
      body.action ===
      "reassign"
    ) {
      const assignmentId =
        positiveId(
          body.assignmentId
        );

      const newDriverId =
        positiveId(
          body.newDriverId
        );

      const reason =
        cleanOptionalText(
          body.cancellationReason
        );

      if (
        !assignmentId ||
        !newDriverId ||
        !reason
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Los datos de reasignación no son válidos.",
          },
          { status: 400 }
        );
      }

      const current =
        await getById(
          assignmentId
        );

      if (!current) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "La asignación actual no existe.",
          },
          { status: 404 }
        );
      }

      if (
        current.status ===
          "Entregado" ||
        current.status ===
          "Cancelado"
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Esta asignación ya está cerrada y no puede reasignarse.",
          },
          { status: 409 }
        );
      }

      if (
        Number(
          current.driver_id
        ) ===
        newDriverId
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Selecciona un repartidor diferente.",
          },
          { status: 400 }
        );
      }

      const activeDriver =
        await getActiveByDriver(
          newDriverId
        );

      if (activeDriver) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "El nuevo repartidor ya tiene una entrega activa.",
          },
          { status: 409 }
        );
      }

      const {
        error: cancelError,
      } = await supabaseAdmin
        .from(
          "delivery_assignments"
        )
        .update({
          status:
            "Cancelado",
          cancelled_at:
            new Date().toISOString(),
          cancellation_reason:
            reason,
        })
        .eq(
          "id",
          assignmentId
        );

      if (cancelError) {
        throw cancelError;
      }

      const overrides =
        body.overrides ?? {};

      const {
        data,
        error,
      } = await supabaseAdmin
        .from(
          "delivery_assignments"
        )
        .insert({
          order_id:
            current.order_id,
          driver_id:
            newDriverId,
          status:
            "Asignado",
          origin_address:
            cleanOptionalText(
              overrides.origin_address ??
                current.origin_address
            ),
          destination_address:
            cleanOptionalText(
              overrides.destination_address ??
                current.destination_address
            ),
          origin_latitude:
            toNullableNumber(
              overrides.origin_latitude ??
                current.origin_latitude
            ),
          origin_longitude:
            toNullableNumber(
              overrides.origin_longitude ??
                current.origin_longitude
            ),
          destination_latitude:
            toNullableNumber(
              overrides.destination_latitude ??
                current.destination_latitude
            ),
          destination_longitude:
            toNullableNumber(
              overrides.destination_longitude ??
                current.destination_longitude
            ),
          distance_km:
            toNullableNumber(
              overrides.distance_km ??
                current.distance_km
            ),
          estimated_duration_minutes:
            toNullableNumber(
              overrides.estimated_duration_minutes ??
                current.estimated_duration_minutes
            ),
          estimated_arrival_at:
            cleanOptionalText(
              overrides.estimated_arrival_at ??
                current.estimated_arrival_at
            ),
          assignment_notes:
            cleanOptionalText(
              overrides.assignment_notes ??
                current.assignment_notes
            ),
          delivery_notes:
            cleanOptionalText(
              overrides.delivery_notes ??
                current.delivery_notes
            ),
        })
        .select(
          ASSIGNMENT_WITH_RELATIONS_SELECT
        )
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({
        ok: true,
        data,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          "Operación Delivery no válida.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "Error creando/reasignando Delivery:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const auth =
      await authorize(
        request,
        true
      );

    if (!auth.ok) {
      return auth.response;
    }

    const body =
      (await request.json()) as {
        action?: unknown;
        assignmentId?: unknown;
        status?: unknown;
        route?: Record<
          string,
          unknown
        >;
        cancellationReason?: unknown;
        deliveryNotes?: unknown;
        proofOfDeliveryUrl?: unknown;
      };

    const assignmentId =
      positiveId(
        body.assignmentId
      );

    if (!assignmentId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Identificador de asignación no válido.",
        },
        { status: 400 }
      );
    }

    let payload:
      Record<
        string,
        unknown
      >;

    if (
      body.action ===
      "status"
    ) {
      if (
        typeof body.status !==
          "string" ||
        !DELIVERY_ASSIGNMENT_STATUSES.includes(
          body.status as DeliveryAssignmentStatus
        )
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "El estado de la asignación no es válido.",
          },
          { status: 400 }
        );
      }

      const status =
        body.status as DeliveryAssignmentStatus;

      const now =
        new Date().toISOString();

      payload = {
        status,
      };

      if (
        status ===
        "Aceptado"
      ) {
        payload.accepted_at =
          now;
      }

      if (
        status ===
        "Preparando retiro"
      ) {
        payload.preparation_completed_at =
          null;
      }

      if (
        status ===
        "Pedido retirado"
      ) {
        payload.preparation_completed_at =
          now;
        payload.picked_up_at =
          now;
      }

      if (
        status ===
        "En ruta"
      ) {
        payload.started_at =
          now;
      }

      if (
        status ===
        "Entregado"
      ) {
        payload.delivered_at =
          now;
        payload.cancelled_at =
          null;
        payload.cancellation_reason =
          null;
      }

      if (
        status ===
        "Cancelado"
      ) {
        payload.cancelled_at =
          now;
      }
    } else if (
      body.action ===
      "complete"
    ) {
      payload = {
        status:
          "Entregado",
        delivered_at:
          new Date().toISOString(),
        cancelled_at:
          null,
        cancellation_reason:
          null,
        delivery_notes:
          cleanOptionalText(
            body.deliveryNotes
          ),
        proof_of_delivery_url:
          cleanOptionalText(
            body.proofOfDeliveryUrl
          ),
      };
    } else if (
      body.action ===
      "cancel"
    ) {
      const reason =
        cleanOptionalText(
          body.cancellationReason
        );

      if (!reason) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Debes registrar el motivo de cancelación.",
          },
          { status: 400 }
        );
      }

      payload = {
        status:
          "Cancelado",
        cancelled_at:
          new Date().toISOString(),
        cancellation_reason:
          reason,
      };
    } else if (
      body.action ===
      "route"
    ) {
      const route =
        body.route ?? {};

      payload = {
        origin_address:
          cleanOptionalText(
            route.origin_address
          ),
        destination_address:
          cleanOptionalText(
            route.destination_address
          ),
        origin_latitude:
          toNullableNumber(
            route.origin_latitude
          ),
        origin_longitude:
          toNullableNumber(
            route.origin_longitude
          ),
        destination_latitude:
          toNullableNumber(
            route.destination_latitude
          ),
        destination_longitude:
          toNullableNumber(
            route.destination_longitude
          ),
        distance_km:
          toNullableNumber(
            route.distance_km
          ),
        estimated_duration_minutes:
          toNullableNumber(
            route.estimated_duration_minutes
          ),
        estimated_arrival_at:
          cleanOptionalText(
            route.estimated_arrival_at
          ),
        assignment_notes:
          cleanOptionalText(
            route.assignment_notes
          ),
        delivery_notes:
          cleanOptionalText(
            route.delivery_notes
          ),
      };
    } else {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Operación Delivery no válida.",
        },
        { status: 400 }
      );
    }

    const {
      data,
      error,
    } = await supabaseAdmin
      .from(
        "delivery_assignments"
      )
      .update(payload)
      .eq(
        "id",
        assignmentId
      )
      .select(
        ASSIGNMENT_WITH_RELATIONS_SELECT
      )
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error:
            databaseErrorMessage(
              error,
              "No fue posible actualizar la asignación."
            ),
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La asignación solicitada no existe.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error(
      "Error actualizando Delivery:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}