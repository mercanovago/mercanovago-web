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

const DRIVER_STATUSES = [
  "Disponible",
  "Ocupado",
  "Fuera de servicio",
  "Inactivo",
] as const;

type DriverStatus =
  (typeof DRIVER_STATUSES)[number];

const DRIVER_VEHICLE_TYPES = [
  "Moto",
  "Bicicleta",
  "Automóvil",
  "Camioneta",
  "A pie",
  "Otro",
] as const;

type DriverVehicleType =
  (typeof DRIVER_VEHICLE_TYPES)[number];

const DRIVER_SELECT = `
  id,
  first_name,
  last_name,
  identification,
  phone,
  email,
  vehicle_type,
  vehicle_brand,
  vehicle_model,
  vehicle_color,
  vehicle_plate,
  status,
  active,
  current_latitude,
  current_longitude,
  last_location_at,
  notes,
  created_at,
  updated_at
`;

interface AuthorizedAdmin {
  userId: string;
  role: string;
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

function positiveId(
  value: unknown
): number | null {
  const id = Number(value);

  return (
    Number.isInteger(id) &&
    id > 0
  )
    ? id
    : null;
}

function cleanOptionalText(
  value: unknown
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const clean =
    value.trim();

  return clean || null;
}

function cleanRequiredText(
  value: unknown,
  fieldName: string
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `El campo ${fieldName} es obligatorio.`
    );
  }

  return value.trim();
}

function validatePhone(
  value: unknown
): string {
  const phone =
    cleanRequiredText(
      value,
      "celular"
    );

  const normalized =
    phone.replace(
      /[\s()-]/g,
      ""
    );

  if (
    !/^\+?\d{7,15}$/.test(
      normalized
    )
  ) {
    throw new Error(
      "El número de celular del repartidor no es válido."
    );
  }

  return phone;
}

function validateEmail(
  value: unknown
): string | null {
  const email =
    cleanOptionalText(
      value
    );

  if (!email) {
    return null;
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  ) {
    throw new Error(
      "El correo electrónico del repartidor no es válido."
    );
  }

  return email.toLowerCase();
}

function validateDriverStatus(
  value: unknown
): DriverStatus {
  if (
    typeof value !== "string" ||
    !DRIVER_STATUSES.includes(
      value as DriverStatus
    )
  ) {
    throw new Error(
      "El estado del repartidor no es válido."
    );
  }

  return value as DriverStatus;
}

function validateVehicleType(
  value: unknown
): DriverVehicleType {
  if (
    typeof value !== "string" ||
    !DRIVER_VEHICLE_TYPES.includes(
      value as DriverVehicleType
    )
  ) {
    throw new Error(
      "El tipo de vehículo seleccionado no es válido."
    );
  }

  return value as DriverVehicleType;
}

function validateLatitude(
  value: unknown
): number {
  const latitude =
    Number(value);

  if (
    !Number.isFinite(
      latitude
    ) ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error(
      "La latitud proporcionada no es válida."
    );
  }

  return latitude;
}

function validateLongitude(
  value: unknown
): number {
  const longitude =
    Number(value);

  if (
    !Number.isFinite(
      longitude
    ) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      "La longitud proporcionada no es válida."
    );
  }

  return longitude;
}

function prepareDriverPayload(
  value: unknown
) {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    throw new Error(
      "Los datos del repartidor no son válidos."
    );
  }

  const driver =
    value as Record<
      string,
      unknown
    >;

  const firstName =
    cleanRequiredText(
      driver.first_name,
      "nombres"
    );

  const lastName =
    cleanRequiredText(
      driver.last_name,
      "apellidos"
    );

  const phone =
    validatePhone(
      driver.phone
    );

  const email =
    validateEmail(
      driver.email
    );

  const vehicleType =
    validateVehicleType(
      driver.vehicle_type
    );

  const active =
    typeof driver.active ===
      "boolean"
      ? driver.active
      : true;

  let status =
    driver.status ===
      undefined
      ? "Disponible"
      : validateDriverStatus(
          driver.status
        );

  if (!active) {
    status = "Inactivo";
  }

  return {
    first_name:
      firstName,

    last_name:
      lastName,

    identification:
      cleanOptionalText(
        driver.identification
      ),

    phone,

    email,

    vehicle_type:
      vehicleType,

    vehicle_brand:
      cleanOptionalText(
        driver.vehicle_brand
      ),

    vehicle_model:
      cleanOptionalText(
        driver.vehicle_model
      ),

    vehicle_color:
      cleanOptionalText(
        driver.vehicle_color
      ),

    vehicle_plate:
      cleanOptionalText(
        driver.vehicle_plate
      )?.toUpperCase() ??
      null,

    status,

    active,

    notes:
      cleanOptionalText(
        driver.notes
      ),
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

  if (
    error.code === "23505"
  ) {
    if (
      text.includes("phone")
    ) {
      return "Ya existe un repartidor registrado con ese número de celular.";
    }

    if (
      text.includes("email")
    ) {
      return "Ya existe un repartidor registrado con ese correo electrónico.";
    }

    if (
      text.includes(
        "identification"
      )
    ) {
      return "Ya existe un repartidor registrado con esa identificación.";
    }

    if (
      text.includes(
        "vehicle_plate"
      ) ||
      text.includes("plate")
    ) {
      return "Ya existe un repartidor registrado con esa placa.";
    }

    return "Ya existe un repartidor con alguno de los datos ingresados.";
  }

  if (
    error.code === "23514"
  ) {
    return "Uno de los valores ingresados no cumple las reglas del Centro Delivery.";
  }

  if (
    error.code === "23503"
  ) {
    return "El repartidor mantiene información relacionada y no puede eliminarse directamente.";
  }

  return (
    error.message ||
    fallback
  );
}

async function getDriverById(
  id: number
) {
  const {
    data,
    error,
  } = await supabaseAdmin
    .from(
      "delivery_drivers"
    )
    .select(DRIVER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      databaseErrorMessage(
        error,
        "No fue posible cargar la información del repartidor."
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
      "all";

    if (
      scope === "all"
    ) {
      const {
        data,
        error,
      } = await supabaseAdmin
        .from(
          "delivery_drivers"
        )
        .select(
          DRIVER_SELECT
        )
        .order(
          "active",
          {
            ascending:
              false,
          }
        )
        .order(
          "first_name",
          {
            ascending:
              true,
          }
        )
        .order(
          "last_name",
          {
            ascending:
              true,
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

    if (
      scope === "available"
    ) {
      const {
        data,
        error,
      } = await supabaseAdmin
        .from(
          "delivery_drivers"
        )
        .select(
          DRIVER_SELECT
        )
        .eq(
          "active",
          true
        )
        .eq(
          "status",
          "Disponible"
        )
        .order(
          "first_name",
          {
            ascending:
              true,
          }
        )
        .order(
          "last_name",
          {
            ascending:
              true,
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

    if (
      scope === "id"
    ) {
      const id =
        positiveId(
          params.get("id")
        );

      if (!id) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "El identificador del repartidor no es válido.",
          },
          { status: 400 }
        );
      }

      const driver =
        await getDriverById(
          id
        );

      if (!driver) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "El repartidor solicitado no existe.",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ok: true,
        data: driver,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error:
          "Consulta de repartidores no válida.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "Error consultando repartidores Delivery:",
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
        driver?: unknown;
      };

    if (
      body.action !==
      "create"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Operación de repartidor no válida.",
        },
        { status: 400 }
      );
    }

    const payload =
      prepareDriverPayload(
        body.driver
      );

    const {
      data,
      error,
    } = await supabaseAdmin
      .from(
        "delivery_drivers"
      )
      .insert(payload)
      .select(
        DRIVER_SELECT
      )
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error:
            databaseErrorMessage(
              error,
              "No fue posible registrar el repartidor."
            ),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error(
      "Error creando repartidor Delivery:",
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
        driverId?: unknown;
        driver?: unknown;
        status?: unknown;
        active?: unknown;
        latitude?: unknown;
        longitude?: unknown;
      };

    const driverId =
      positiveId(
        body.driverId
      );

    if (!driverId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El identificador del repartidor no es válido.",
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
      "update"
    ) {
      payload =
        prepareDriverPayload(
          body.driver
        );
    } else if (
      body.action ===
      "status"
    ) {
      const status =
        validateDriverStatus(
          body.status
        );

      payload = {
        status,
        active:
          status !==
          "Inactivo",
      };
    } else if (
      body.action ===
      "active"
    ) {
      if (
        typeof body.active !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "El estado de actividad del repartidor no es válido.",
          },
          { status: 400 }
        );
      }

      payload = {
        active:
          body.active,

        status:
          body.active
            ? "Disponible"
            : "Inactivo",
      };
    } else if (
      body.action ===
      "location"
    ) {
      const latitude =
        validateLatitude(
          body.latitude
        );

      const longitude =
        validateLongitude(
          body.longitude
        );

      payload = {
        current_latitude:
          latitude,

        current_longitude:
          longitude,

        last_location_at:
          new Date().toISOString(),
      };
    } else {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Operación de repartidor no válida.",
        },
        { status: 400 }
      );
    }

    const {
      data,
      error,
    } = await supabaseAdmin
      .from(
        "delivery_drivers"
      )
      .update(payload)
      .eq(
        "id",
        driverId
      )
      .select(
        DRIVER_SELECT
      )
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error:
            databaseErrorMessage(
              error,
              "No fue posible actualizar el repartidor."
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
            "El repartidor solicitado no existe.",
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
      "Error actualizando repartidor Delivery:",
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

export async function DELETE(
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

    const driverId =
      positiveId(
        request.nextUrl
          .searchParams
          .get("driverId")
      );

    if (!driverId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "El identificador del repartidor no es válido.",
        },
        { status: 400 }
      );
    }

    const {
      data:
        activeAssignments,
      error:
        assignmentError,
    } = await supabaseAdmin
      .from(
        "delivery_assignments"
      )
      .select("id")
      .eq(
        "driver_id",
        driverId
      )
      .not(
        "status",
        "in",
        '("Entregado","Cancelado")'
      )
      .limit(1);

    if (assignmentError) {
      console.error(
        "Error verificando asignaciones del repartidor:",
        assignmentError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "No fue posible verificar las asignaciones del repartidor.",
        },
        { status: 500 }
      );
    }

    if (
      activeAssignments &&
      activeAssignments.length >
        0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No es posible eliminar un repartidor que mantiene una entrega activa.",
        },
        { status: 409 }
      );
    }

    const {
      error,
    } = await supabaseAdmin
      .from(
        "delivery_drivers"
      )
      .delete()
      .eq(
        "id",
        driverId
      );

    if (error) {
      if (
        error.code ===
        "23503"
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "El repartidor tiene asignaciones históricas. Desactívalo en lugar de eliminarlo.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error:
            databaseErrorMessage(
              error,
              "No fue posible eliminar el repartidor."
            ),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: driverId,
      },
    });
  } catch (error) {
    console.error(
      "Error eliminando repartidor Delivery:",
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