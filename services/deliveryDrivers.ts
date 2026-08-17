import { supabase } from "@/lib/supabase";

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

  current_latitude: number | string | null;
  current_longitude: number | string | null;
  last_location_at: string | null;

  notes: string | null;

  created_at: string;
  updated_at: string;
}

function cleanOptionalText(
  value: string | null | undefined
): string | null {
  const cleanValue = value?.trim() ?? "";

  return cleanValue || null;
}

function cleanRequiredText(
  value: string,
  fieldName: string
): string {
  const cleanValue = value.trim();

  if (!cleanValue) {
    throw new Error(
      `El campo ${fieldName} es obligatorio.`
    );
  }

  return cleanValue;
}

function toNullableNumber(
  value: number | string | null | undefined
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const converted = Number(value);

  return Number.isFinite(converted)
    ? converted
    : null;
}

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeDriverStatus(
  value: string | null | undefined
): DriverStatus {
  const normalized = normalizeText(value ?? "");

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

  if (normalized.includes("inactiv")) {
    return "Inactivo";
  }

  return "Disponible";
}

function normalizeVehicleType(
  value: string | null | undefined
): DriverVehicleType {
  const normalized = normalizeText(value ?? "");

  if (normalized.includes("bicicleta")) {
    return "Bicicleta";
  }

  if (
    normalized.includes("automovil") ||
    normalized.includes("carro")
  ) {
    return "Automóvil";
  }

  if (normalized.includes("camioneta")) {
    return "Camioneta";
  }

  if (
    normalized.includes("pie") ||
    normalized.includes("caminando")
  ) {
    return "A pie";
  }

  if (normalized.includes("otro")) {
    return "Otro";
  }

  return "Moto";
}

function validatePhone(phone: string): string {
  const cleanPhone = phone.trim();

  if (!cleanPhone) {
    throw new Error(
      "El número de celular del repartidor es obligatorio."
    );
  }

  const normalizedPhone = cleanPhone.replace(
    /[\s()-]/g,
    ""
  );

  if (!/^\+?\d{7,15}$/.test(normalizedPhone)) {
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
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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
  if (!DRIVER_STATUSES.includes(status)) {
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
    !DRIVER_VEHICLE_TYPES.includes(vehicleType)
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

    first_name: driver.first_name?.trim() ?? "",
    last_name: driver.last_name?.trim() ?? "",

    identification:
      cleanOptionalText(driver.identification),

    phone: driver.phone?.trim() ?? "",

    email: cleanOptionalText(driver.email),

    vehicle_type: normalizeVehicleType(
      driver.vehicle_type
    ),

    vehicle_brand:
      cleanOptionalText(driver.vehicle_brand),

    vehicle_model:
      cleanOptionalText(driver.vehicle_model),

    vehicle_color:
      cleanOptionalText(driver.vehicle_color),

    vehicle_plate:
      cleanOptionalText(
        driver.vehicle_plate
      )?.toUpperCase() ?? null,

    status: normalizeDriverStatus(driver.status),

    active: driver.active !== false,

    current_latitude: toNullableNumber(
      driver.current_latitude
    ),

    current_longitude: toNullableNumber(
      driver.current_longitude
    ),

    last_location_at: driver.last_location_at,

    notes: cleanOptionalText(driver.notes),

    created_at: driver.created_at,
    updated_at: driver.updated_at,
  };
}

function prepareDriverPayload(
  driver: DeliveryDriverFormData
) {
  const firstName = cleanRequiredText(
    driver.first_name,
    "nombres"
  );

  const lastName = cleanRequiredText(
    driver.last_name,
    "apellidos"
  );

  const phone = validatePhone(driver.phone);

  const email = validateEmail(
    cleanOptionalText(driver.email)
  );

  const vehicleType = validateVehicleType(
    driver.vehicle_type
  );

  const active = driver.active ?? true;

  let status = validateDriverStatus(
    driver.status ?? "Disponible"
  );

  if (!active) {
    status = "Inactivo";
  }

  return {
    first_name: firstName,
    last_name: lastName,

    identification: cleanOptionalText(
      driver.identification
    ),

    phone,
    email,

    vehicle_type: vehicleType,

    vehicle_brand: cleanOptionalText(
      driver.vehicle_brand
    ),

    vehicle_model: cleanOptionalText(
      driver.vehicle_model
    ),

    vehicle_color: cleanOptionalText(
      driver.vehicle_color
    ),

    vehicle_plate:
      cleanOptionalText(
        driver.vehicle_plate
      )?.toUpperCase() ?? null,

    status,
    active,

    notes: cleanOptionalText(driver.notes),
  };
}

function getDatabaseErrorMessage(
  error: {
    code?: string;
    message?: string;
    details?: string;
  },
  defaultMessage: string
): string {
  if (error.code === "23505") {
    const details = normalizeText(
      `${error.message ?? ""} ${
        error.details ?? ""
      }`
    );

    if (details.includes("phone")) {
      return "Ya existe un repartidor registrado con ese número de celular.";
    }

    if (details.includes("email")) {
      return "Ya existe un repartidor registrado con ese correo electrónico.";
    }

    if (details.includes("identification")) {
      return "Ya existe un repartidor registrado con esa identificación.";
    }

    if (
      details.includes("vehicle_plate") ||
      details.includes("plate")
    ) {
      return "Ya existe un repartidor registrado con esa placa.";
    }

    return "Ya existe un repartidor con alguno de los datos ingresados.";
  }

  if (error.code === "23514") {
    return "Uno de los valores ingresados no cumple las reglas del Centro Delivery.";
  }

  return defaultMessage;
}

export async function getDeliveryDrivers(): Promise<
  DeliveryDriver[]
> {
  const { data, error } = await supabase
    .from("delivery_drivers")
    .select(`
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
    `)
    .order("active", {
      ascending: false,
    })
    .order("first_name", {
      ascending: true,
    })
    .order("last_name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error cargando repartidores:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    throw new Error(
      "No fue posible cargar los repartidores de MercaNova GO."
    );
  }

  return ((data ?? []) as RawDeliveryDriver[]).map(
    normalizeDriver
  );
}

export async function getAvailableDeliveryDrivers(): Promise<
  DeliveryDriver[]
> {
  const { data, error } = await supabase
    .from("delivery_drivers")
    .select(`
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
    `)
    .eq("active", true)
    .eq("status", "Disponible")
    .order("first_name", {
      ascending: true,
    })
    .order("last_name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error cargando repartidores disponibles:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    throw new Error(
      "No fue posible cargar los repartidores disponibles."
    );
  }

  return ((data ?? []) as RawDeliveryDriver[]).map(
    normalizeDriver
  );
}

export async function getDeliveryDriverById(
  id: number
): Promise<DeliveryDriver> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "El identificador del repartidor no es válido."
    );
  }

  const { data, error } = await supabase
    .from("delivery_drivers")
    .select(`
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
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error(
      "Error cargando repartidor:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    throw new Error(
      "No fue posible cargar la información del repartidor."
    );
  }

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
  const payload = prepareDriverPayload(driver);

  const { data, error } = await supabase
    .from("delivery_drivers")
    .insert(payload)
    .select(`
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
    `)
    .single();

  if (error) {
    console.error(
      "Error creando repartidor:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    throw new Error(
      getDatabaseErrorMessage(
        error,
        "No fue posible registrar el repartidor."
      )
    );
  }

  if (!data) {
    throw new Error(
      "Supabase no devolvió el repartidor registrado."
    );
  }

  return normalizeDriver(
    data as RawDeliveryDriver
  );
}

export async function updateDeliveryDriver(
  id: number,
  driver: DeliveryDriverFormData
): Promise<DeliveryDriver> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "El identificador del repartidor no es válido."
    );
  }

  const payload = prepareDriverPayload(driver);

  const { data, error } = await supabase
    .from("delivery_drivers")
    .update(payload)
    .eq("id", id)
    .select(`
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
    `)
    .single();

  if (error) {
    console.error(
      "Error actualizando repartidor:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    throw new Error(
      getDatabaseErrorMessage(
        error,
        "No fue posible actualizar el repartidor."
      )
    );
  }

  if (!data) {
    throw new Error(
      "Supabase no devolvió el repartidor actualizado."
    );
  }

  return normalizeDriver(
    data as RawDeliveryDriver
  );
}

export async function updateDeliveryDriverStatus(
  id: number,
  status: DriverStatus
): Promise<DeliveryDriver> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "El identificador del repartidor no es válido."
    );
  }

  const validStatus =
    validateDriverStatus(status);

  const active = validStatus !== "Inactivo";

  const { data, error } = await supabase
    .from("delivery_drivers")
    .update({
      status: validStatus,
      active,
    })
    .eq("id", id)
    .select(`
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
    `)
    .single();

  if (error) {
    console.error(
      "Error actualizando estado del repartidor:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    throw new Error(
      "No fue posible actualizar el estado del repartidor."
    );
  }

  if (!data) {
    throw new Error(
      "Supabase no devolvió el repartidor actualizado."
    );
  }

  return normalizeDriver(
    data as RawDeliveryDriver
  );
}

export async function setDeliveryDriverActive(
  id: number,
  active: boolean
): Promise<DeliveryDriver> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "El identificador del repartidor no es válido."
    );
  }

  const status: DriverStatus = active
    ? "Disponible"
    : "Inactivo";

  const { data, error } = await supabase
    .from("delivery_drivers")
    .update({
      active,
      status,
    })
    .eq("id", id)
    .select(`
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
    `)
    .single();

  if (error) {
    console.error(
      "Error cambiando actividad del repartidor:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    throw new Error(
      active
        ? "No fue posible activar el repartidor."
        : "No fue posible desactivar el repartidor."
    );
  }

  if (!data) {
    throw new Error(
      "Supabase no devolvió el repartidor actualizado."
    );
  }

  return normalizeDriver(
    data as RawDeliveryDriver
  );
}

export async function updateDeliveryDriverLocation(
  id: number,
  latitude: number,
  longitude: number
): Promise<DeliveryDriver> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "El identificador del repartidor no es válido."
    );
  }

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

  const { data, error } = await supabase
    .from("delivery_drivers")
    .update({
      current_latitude: latitude,
      current_longitude: longitude,
      last_location_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(`
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
    `)
    .single();

  if (error) {
    console.error(
      "Error actualizando ubicación del repartidor:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    throw new Error(
      "No fue posible actualizar la ubicación del repartidor."
    );
  }

  if (!data) {
    throw new Error(
      "Supabase no devolvió la ubicación actualizada."
    );
  }

  return normalizeDriver(
    data as RawDeliveryDriver
  );
}

export async function deleteDeliveryDriver(
  id: number
): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "El identificador del repartidor no es válido."
    );
  }

  const { data: activeAssignments, error: assignmentError } =
    await supabase
      .from("delivery_assignments")
      .select("id")
      .eq("driver_id", id)
      .not("status", "in", '("Entregado","Cancelado")')
      .limit(1);

  if (assignmentError) {
    console.error(
      "Error verificando asignaciones del repartidor:",
      assignmentError
    );

    throw new Error(
      "No fue posible verificar las asignaciones del repartidor."
    );
  }

  if (
    activeAssignments &&
    activeAssignments.length > 0
  ) {
    throw new Error(
      "No es posible eliminar un repartidor que mantiene una entrega activa."
    );
  }

  const { error } = await supabase
    .from("delivery_drivers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(
      "Error eliminando repartidor:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    if (error.code === "23503") {
      throw new Error(
        "El repartidor tiene asignaciones históricas. Desactívalo en lugar de eliminarlo."
      );
    }

    throw new Error(
      "No fue posible eliminar el repartidor."
    );
  }
}