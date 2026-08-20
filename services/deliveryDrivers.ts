import { getAdminSession } from "@/services/adminLogin";

export const DRIVER_STATUSES = [
  "Disponible",
  "Ocupado",
  "Fuera de servicio",
  "Inactivo",
] as const;

export type DriverStatus =
  (typeof DRIVER_STATUSES)[number];

export const DRIVER_VEHICLE_TYPES = [
  "Moto",
  "Bicicleta",
  "Automóvil",
  "Camioneta",
  "A pie",
  "Otro",
] as const;

export type DriverVehicleType =
  (typeof DRIVER_VEHICLE_TYPES)[number];

export interface DeliveryDriver {
  id: number;

  first_name: string;
  last_name: string;

  identification: string | null;
  phone: string;
  email: string | null;

  vehicle_type: DriverVehicleType;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_color: string | null;
  vehicle_plate: string | null;

  status: DriverStatus;
  active: boolean;

  current_latitude: number | null;
  current_longitude: number | null;
  last_location_at: string | null;

  notes: string | null;

  created_at: string;
  updated_at: string;
}

export interface DeliveryDriverFormData {
  first_name: string;
  last_name: string;

  identification?: string | null;
  phone: string;
  email?: string | null;

  vehicle_type: DriverVehicleType;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
  vehicle_color?: string | null;
  vehicle_plate?: string | null;

  status?: DriverStatus;
  active?: boolean;

  notes?: string | null;
}

interface RawDeliveryDriver {
  id: number | string;

  first_name: string | null;
  last_name: string | null;

  identification: string | null;
  phone: string | null;
  email: string | null;

  vehicle_type: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_color: string | null;
  vehicle_plate: string | null;

  status: string | null;
  active: boolean | null;

  current_latitude:
    | number
    | string
    | null;

  current_longitude:
    | number
    | string
    | null;

  last_location_at: string | null;

  notes: string | null;

  created_at: string;
  updated_at: string;
}

interface DeliveryDriverApiResponse {
  ok: boolean;
  data?: unknown;
  error?: string;
}

function cleanOptionalText(
  value: string | null | undefined
): string | null {
  const cleanValue =
    value?.trim() ?? "";

  return cleanValue || null;
}

function cleanRequiredText(
  value: string,
  fieldName: string
): string {
  const cleanValue =
    value.trim();

  if (!cleanValue) {
    throw new Error(
      `El campo ${fieldName} es obligatorio.`
    );
  }

  return cleanValue;
}

function toNullableNumber(
  value:
    | number
    | string
    | null
    | undefined
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

function normalizeText(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
}

function normalizeDriverStatus(
  value: string | null | undefined
): DriverStatus {
  const normalized =
    normalizeText(value ?? "");

  if (
    normalized.includes("ocupado") ||
    normalized.includes("entrega")
  ) {
    return "Ocupado";
  }

  if (
    normalized.includes("fuera") ||
    normalized.includes("servicio")
  ) {
    return "Fuera de servicio";
  }

  if (
    normalized.includes("inactiv")
  ) {
    return "Inactivo";
  }

  return "Disponible";
}

function normalizeVehicleType(
  value: string | null | undefined
): DriverVehicleType {
  const normalized =
    normalizeText(value ?? "");

  if (
    normalized.includes("bicicleta")
  ) {
    return "Bicicleta";
  }

  if (
    normalized.includes("automovil") ||
    normalized.includes("carro")
  ) {
    return "Automóvil";
  }

  if (
    normalized.includes("camioneta")
  ) {
    return "Camioneta";
  }

  if (
    normalized.includes("pie") ||
    normalized.includes("caminando")
  ) {
    return "A pie";
  }

  if (
    normalized.includes("otro")
  ) {
    return "Otro";
  }

  return "Moto";
}

function validatePhone(
  phone: string
): string {
  const cleanPhone =
    phone.trim();

  if (!cleanPhone) {
    throw new Error(
      "El número de celular del repartidor es obligatorio."
    );
  }

  const normalizedPhone =
    cleanPhone.replace(
      /[\s()-]/g,
      ""
    );

  if (
    !/^\+?\d{7,15}$/.test(
      normalizedPhone
    )
  ) {
    throw new Error(
      "El número de celular del repartidor no es válido."
    );
  }

  return cleanPhone;
}

function validateEmail(
  email: string | null
): string | null {
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
  status: DriverStatus
): DriverStatus {
  if (
    !DRIVER_STATUSES.includes(
      status
    )
  ) {
    throw new Error(
      "El estado del repartidor no es válido."
    );
  }

  return status;
}

function validateVehicleType(
  vehicleType: DriverVehicleType
): DriverVehicleType {
  if (
    !DRIVER_VEHICLE_TYPES.includes(
      vehicleType
    )
  ) {
    throw new Error(
      "El tipo de vehículo seleccionado no es válido."
    );
  }

  return vehicleType;
}

function normalizeDriver(
  driver: RawDeliveryDriver
): DeliveryDriver {
  return {
    id: Number(driver.id),

    first_name:
      driver.first_name?.trim() ??
      "",

    last_name:
      driver.last_name?.trim() ??
      "",

    identification:
      cleanOptionalText(
        driver.identification
      ),

    phone:
      driver.phone?.trim() ?? "",

    email:
      cleanOptionalText(
        driver.email
      ),

    vehicle_type:
      normalizeVehicleType(
        driver.vehicle_type
      ),

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
      )?.toUpperCase() ?? null,

    status:
      normalizeDriverStatus(
        driver.status
      ),

    active:
      driver.active !== false,

    current_latitude:
      toNullableNumber(
        driver.current_latitude
      ),

    current_longitude:
      toNullableNumber(
        driver.current_longitude
      ),

    last_location_at:
      driver.last_location_at,

    notes:
      cleanOptionalText(
        driver.notes
      ),

    created_at:
      driver.created_at,

    updated_at:
      driver.updated_at,
  };
}

function prepareDriverPayload(
  driver: DeliveryDriverFormData
) {
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
      cleanOptionalText(
        driver.email
      )
    );

  const vehicleType =
    validateVehicleType(
      driver.vehicle_type
    );

  const active =
    driver.active ?? true;

  let status =
    validateDriverStatus(
      driver.status ??
        "Disponible"
    );

  if (!active) {
    status = "Inactivo";
  }

  return {
    first_name: firstName,
    last_name: lastName,

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
      )?.toUpperCase() ?? null,

    status,
    active,

    notes:
      cleanOptionalText(
        driver.notes
      ),
  };
}

function validateDriverId(
  id: number
): number {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "El identificador del repartidor no es válido."
    );
  }

  return id;
}

async function getAccessToken(): Promise<string> {
  const session =
    await getAdminSession();

  if (!session?.accessToken) {
    throw new Error(
      "No existe una sesión administrativa válida."
    );
  }

  return session.accessToken;
}

async function callDriversApi(
  options: {
    method?:
      | "GET"
      | "POST"
      | "PATCH"
      | "DELETE";
    query?: URLSearchParams;
    body?: Record<
      string,
      unknown
    >;
  } = {}
): Promise<unknown> {
  const accessToken =
    await getAccessToken();

  const queryString =
    options.query?.toString();

  const url =
    queryString
      ? `/api/admin/delivery/drivers?${queryString}`
      : "/api/admin/delivery/drivers";

  const response =
    await fetch(url, {
      method:
        options.method ??
        "GET",

      cache: "no-store",

      headers: {
        Accept:
          "application/json",

        Authorization:
          `Bearer ${accessToken}`,

        ...(options.body
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),
      },

      ...(options.body
        ? {
            body:
              JSON.stringify(
                options.body
              ),
          }
        : {}),
    });

  let result:
    | DeliveryDriverApiResponse
    | null = null;

  try {
    result =
      (await response.json()) as
        DeliveryDriverApiResponse;
  } catch {
    result = null;
  }

  if (
    !response.ok ||
    !result?.ok
  ) {
    throw new Error(
      result?.error ??
        `Error HTTP ${response.status}.`
    );
  }

  return result.data;
}

export async function getDeliveryDrivers(): Promise<
  DeliveryDriver[]
> {
  const query =
    new URLSearchParams({
      scope: "all",
    });

  const data =
    await callDriversApi({
      query,
    });

  return (
    (data ?? []) as
      RawDeliveryDriver[]
  ).map(normalizeDriver);
}

export async function getAvailableDeliveryDrivers(): Promise<
  DeliveryDriver[]
> {
  const query =
    new URLSearchParams({
      scope: "available",
    });

  const data =
    await callDriversApi({
      query,
    });

  return (
    (data ?? []) as
      RawDeliveryDriver[]
  ).map(normalizeDriver);
}

export async function getDeliveryDriverById(
  id: number
): Promise<DeliveryDriver> {
  const driverId =
    validateDriverId(id);

  const query =
    new URLSearchParams({
      scope: "id",
      id: String(driverId),
    });

  const data =
    await callDriversApi({
      query,
    });

  if (!data) {
    throw new Error(
      "El repartidor solicitado no existe."
    );
  }

  return normalizeDriver(
    data as RawDeliveryDriver
  );
}

export async function createDeliveryDriver(
  driver: DeliveryDriverFormData
): Promise<DeliveryDriver> {
  const payload =
    prepareDriverPayload(
      driver
    );

  const data =
    await callDriversApi({
      method: "POST",
      body: {
        action: "create",
        driver: payload,
      },
    });

  return normalizeDriver(
    data as RawDeliveryDriver
  );
}

export async function updateDeliveryDriver(
  id: number,
  driver: DeliveryDriverFormData
): Promise<DeliveryDriver> {
  const driverId =
    validateDriverId(id);

  const payload =
    prepareDriverPayload(
      driver
    );

  const data =
    await callDriversApi({
      method: "PATCH",
      body: {
        action: "update",
        driverId,
        driver: payload,
      },
    });

  return normalizeDriver(
    data as RawDeliveryDriver
  );
}

export async function updateDeliveryDriverStatus(
  id: number,
  status: DriverStatus
): Promise<DeliveryDriver> {
  const driverId =
    validateDriverId(id);

  const validStatus =
    validateDriverStatus(
      status
    );

  const data =
    await callDriversApi({
      method: "PATCH",
      body: {
        action: "status",
        driverId,
        status: validStatus,
      },
    });

  return normalizeDriver(
    data as RawDeliveryDriver
  );
}

export async function setDeliveryDriverActive(
  id: number,
  active: boolean
): Promise<DeliveryDriver> {
  const driverId =
    validateDriverId(id);

  const data =
    await callDriversApi({
      method: "PATCH",
      body: {
        action: "active",
        driverId,
        active,
      },
    });

  return normalizeDriver(
    data as RawDeliveryDriver
  );
}

export async function updateDeliveryDriverLocation(
  id: number,
  latitude: number,
  longitude: number
): Promise<DeliveryDriver> {
  const driverId =
    validateDriverId(id);

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    throw new Error(
      "La latitud proporcionada no es válida."
    );
  }

  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      "La longitud proporcionada no es válida."
    );
  }

  const data =
    await callDriversApi({
      method: "PATCH",
      body: {
        action: "location",
        driverId,
        latitude,
        longitude,
      },
    });

  return normalizeDriver(
    data as RawDeliveryDriver
  );
}

export async function deleteDeliveryDriver(
  id: number
): Promise<void> {
  const driverId =
    validateDriverId(id);

  const query =
    new URLSearchParams({
      driverId:
        String(driverId),
    });

  await callDriversApi({
    method: "DELETE",
    query,
  });
}