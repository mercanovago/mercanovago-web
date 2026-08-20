import {
  NextRequest,
  NextResponse,
} from "next/server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ADMIN_ROLES = new Set([
  "super_admin",
  "admin",
  "order_manager",
  "support",
]);

const ORDER_STATUSES = [
  "Pendiente",
  "Confirmado",
  "Preparando",
  "En camino",
  "Entregado",
  "Cancelado",
] as const;

type OrderStatus =
  (typeof ORDER_STATUSES)[number];

const DELIVERY_STATUSES = [
  "Pendiente",
  "Por coordinar",
  "Programada",
  "Confirmada",
  "Preparando",
  "Lista para entrega",
  "En camino",
  "Entregada",
  "Cancelada",
] as const;

type DeliveryStatus =
  (typeof DELIVERY_STATUSES)[number];

interface AuthorizedAdmin {
  userId: string;
  role: string;
}

function getBearerToken(
  request: NextRequest
): string | null {
  const authorization =
    request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const [scheme, token] =
    authorization.split(" ");

  if (
    scheme?.toLowerCase() !== "bearer" ||
    !token?.trim()
  ) {
    return null;
  }

  return token.trim();
}

function isValidOrderStatus(
  status: unknown
): status is OrderStatus {
  return (
    typeof status === "string" &&
    ORDER_STATUSES.includes(
      status as OrderStatus
    )
  );
}

function isValidDeliveryStatus(
  status: unknown
): status is DeliveryStatus {
  return (
    typeof status === "string" &&
    DELIVERY_STATUSES.includes(
      status as DeliveryStatus
    )
  );
}

function isValidDateValue(
  value: unknown
): value is string {
  if (typeof value !== "string" || !value) {
    return false;
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  return !Number.isNaN(date.getTime());
}

function isValidTimeValue(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(
      value
    )
  );
}

function createEstimatedDelivery(
  deliveryDate: string,
  deliveryTime: string
): string {
  const date = new Date(
    `${deliveryDate}T${deliveryTime}:00`
  );

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      "La fecha y la hora seleccionadas no son válidas."
    );
  }

  return date.toISOString();
}

async function authorizeAdmin(
  request: NextRequest
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
  const accessToken =
    getBearerToken(request);

  if (!accessToken) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error: "No autorizado.",
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
      accessToken
    );

  if (userError || !user) {
    console.warn(
      "Intento de acceso a pedidos con sesión inválida:",
      userError?.message ??
        "Usuario no encontrado."
    );

    return {
      ok: false,
      response: NextResponse.json(
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
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Error verificando autorización administrativa:",
      profileError
    );

    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error:
            "No fue posible verificar la autorización administrativa.",
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
      response: NextResponse.json(
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
    ).getTime() > Date.now()
  ) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error:
            "La cuenta administrativa se encuentra bloqueada.",
        },
        { status: 403 }
      ),
    };
  }

  if (
    !ALLOWED_ADMIN_ROLES.has(
      profile.role
    )
  ) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          ok: false,
          error:
            "El rol administrativo no tiene acceso a pedidos.",
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

export async function GET(
  request: NextRequest
) {
  try {
    const authorization =
      await authorizeAdmin(request);

    if (!authorization.ok) {
      return authorization.response;
    }

    const { data, error } =
      await supabaseAdmin
        .from("orders")
        .select(`
          id,
          subtotal,
          delivery,
          total,
          payment_method,
          status,
          created_at,
          delivery_type,
          delivery_date,
          delivery_time,
          delivery_window,
          estimated_delivery,
          delivery_notes,
          delivery_status,
          customers (
            first_name,
            last_name,
            phone,
            email,
            address
          ),
          order_items (
            id,
            quantity,
            unit_price,
            subtotal,
            products (
              id,
              name,
              image,
              unit
            )
          )
        `)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "Error cargando pedidos administrativos:",
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "No fue posible cargar los pedidos de MercaNova GO.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: data ?? [],
    });
  } catch (error) {
    console.error(
      "Error inesperado en API administrativa de pedidos:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
  try {
    const authorization =
      await authorizeAdmin(request);

    if (!authorization.ok) {
      return authorization.response;
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El cuerpo de la solicitud no es válido.",
        },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Los datos enviados no son válidos.",
        },
        { status: 400 }
      );
    }

    const payload = body as {
      id?: unknown;
      status?: unknown;
      delivery_status?: unknown;
      delivery_schedule?: unknown;
    };

    const id = Number(payload.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El identificador del pedido no es válido.",
        },
        { status: 400 }
      );
    }

    const operations = [
      payload.status !== undefined,
      payload.delivery_status !== undefined,
      payload.delivery_schedule !== undefined,
    ].filter(Boolean).length;

    if (operations !== 1) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Debe enviarse exactamente una operación para actualizar.",
        },
        { status: 400 }
      );
    }

    if (payload.status !== undefined) {
      if (
        !isValidOrderStatus(
          payload.status
        )
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "El estado seleccionado no es válido.",
          },
          { status: 400 }
        );
      }

      const status = payload.status;

      const {
        data,
        error,
      } = await supabaseAdmin
        .from("orders")
        .update({
          status,
        })
        .eq("id", id)
        .select("id,status")
        .maybeSingle();

      if (error) {
        console.error(
          "Error actualizando estado del pedido:",
          {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            orderId: id,
          }
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "No fue posible actualizar el estado del pedido.",
          },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "El pedido solicitado no existe.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ok: true,
        data: {
          id: Number(data.id),
          status:
            data.status as OrderStatus,
        },
      });
    }

    if (
      payload.delivery_status !==
      undefined
    ) {
      if (
        !isValidDeliveryStatus(
          payload.delivery_status
        )
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "El estado logístico seleccionado no es válido.",
          },
          { status: 400 }
        );
      }

      const deliveryStatus =
        payload.delivery_status;

      const {
        data,
        error,
      } = await supabaseAdmin
        .from("orders")
        .update({
          delivery_status:
            deliveryStatus,
        })
        .eq("id", id)
        .select(
          "id,delivery_status"
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Error actualizando estado logístico:",
          {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            orderId: id,
          }
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "No fue posible actualizar el estado logístico del pedido.",
          },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "El pedido solicitado no existe.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ok: true,
        data: {
          id: Number(data.id),
          delivery_status:
            data.delivery_status as DeliveryStatus,
        },
      });
    }

    if (
      typeof payload.delivery_schedule !==
        "object" ||
      payload.delivery_schedule === null
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Los datos de programación de entrega no son válidos.",
        },
        { status: 400 }
      );
    }

    const schedule =
      payload.delivery_schedule as {
        delivery_date?: unknown;
        delivery_time?: unknown;
        delivery_window?: unknown;
        delivery_notes?: unknown;
      };

    if (
      !isValidDateValue(
        schedule.delivery_date
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La fecha seleccionada no es válida.",
        },
        { status: 400 }
      );
    }

    if (
      !isValidTimeValue(
        schedule.delivery_time
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La hora seleccionada no es válida.",
        },
        { status: 400 }
      );
    }

    if (
      typeof schedule.delivery_window !==
        "string" ||
      !schedule.delivery_window.trim()
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El intervalo de entrega es obligatorio.",
        },
        { status: 400 }
      );
    }

    if (
      schedule.delivery_notes !== undefined &&
      schedule.delivery_notes !== null &&
      typeof schedule.delivery_notes !==
        "string"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Las observaciones de entrega no son válidas.",
        },
        { status: 400 }
      );
    }

    const scheduledDateTime =
      new Date(
        `${schedule.delivery_date}T${schedule.delivery_time}:00`
      );

    if (
      Number.isNaN(
        scheduledDateTime.getTime()
      ) ||
      scheduledDateTime.getTime() <=
        Date.now()
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No es posible confirmar una fecha u hora vencida.",
        },
        { status: 400 }
      );
    }

    const estimatedDelivery =
      createEstimatedDelivery(
        schedule.delivery_date,
        schedule.delivery_time
      );

    const deliveryNotes =
      typeof schedule.delivery_notes ===
      "string"
        ? schedule.delivery_notes.trim() ||
          null
        : null;

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("orders")
      .update({
        delivery_date:
          schedule.delivery_date,
        delivery_time:
          schedule.delivery_time,
        delivery_window:
          schedule.delivery_window.trim(),
        estimated_delivery:
          estimatedDelivery,
        delivery_notes:
          deliveryNotes,
        delivery_status:
          "Confirmada",
      })
      .eq("id", id)
      .select(`
        id,
        delivery_date,
        delivery_time,
        delivery_window,
        estimated_delivery,
        delivery_notes,
        delivery_status
      `)
      .maybeSingle();

    if (error) {
      console.error(
        "Error confirmando programación de entrega:",
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          orderId: id,
        }
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "No fue posible confirmar la fecha y hora de entrega.",
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El pedido solicitado no existe.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: Number(data.id),
        delivery_date:
          String(data.delivery_date),
        delivery_time:
          String(data.delivery_time),
        delivery_window:
          String(
            data.delivery_window
          ),
        estimated_delivery:
          String(
            data.estimated_delivery
          ),
        delivery_notes:
          typeof data.delivery_notes ===
          "string"
            ? data.delivery_notes
            : null,
        delivery_status:
          "Confirmada" as const,
      },
    });
  } catch (error) {
    console.error(
      "Error inesperado actualizando pedido:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Error interno del servidor.",
      },
      { status: 500 }
    );
  }
}