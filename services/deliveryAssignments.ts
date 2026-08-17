import { supabase } from "@/lib/supabase";

export const DELIVERY_ASSIGNMENT_STATUSES = [
  "Asignado",
  "Aceptado",
  "Preparando retiro",
  "Pedido retirado",
  "En ruta",
  "Entregado",
  "Cancelado",
] as const;

export type DeliveryAssignmentStatus =
  (typeof DELIVERY_ASSIGNMENT_STATUSES)[number];

export interface DeliveryAssignment {
  id: number;
  order_id: number;
  driver_id: number;

  status: DeliveryAssignmentStatus;

  assigned_at: string;
  accepted_at: string | null;
  preparation_completed_at: string | null;
  picked_up_at: string | null;
  started_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  estimated_arrival_at: string | null;

  origin_address: string | null;
  destination_address: string | null;

  origin_latitude: number | null;
  origin_longitude: number | null;
  destination_latitude: number | null;
  destination_longitude: number | null;

  distance_km: number | null;
  estimated_duration_minutes: number | null;

  assignment_notes: string | null;
  delivery_notes: string | null;
  cancellation_reason: string | null;
  proof_of_delivery_url: string | null;

  created_at: string;
  updated_at: string;
}

export interface DeliveryAssignmentDriver {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  vehicle_type: string;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_color: string | null;
  vehicle_plate: string | null;
  status: string;
  active: boolean;
}

export interface DeliveryAssignmentOrder {
  id: number;
  customer_id: number;
  status: string;
  delivery_status: string | null;
  delivery_type: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  delivery_window: string | null;
  estimated_delivery: string | null;
  delivery_notes: string | null;
  total: number;
  created_at: string;
}

export interface DeliveryAssignmentWithRelations
  extends DeliveryAssignment {
  delivery_drivers: DeliveryAssignmentDriver | null;
  orders: DeliveryAssignmentOrder | null;
}

export interface CreateDeliveryAssignmentInput {
  order_id: number;
  driver_id: number;

  origin_address?: string | null;
  destination_address?: string | null;

  origin_latitude?: number | null;
  origin_longitude?: number | null;
  destination_latitude?: number | null;
  destination_longitude?: number | null;

  distance_km?: number | null;
  estimated_duration_minutes?: number | null;
  estimated_arrival_at?: string | null;

  assignment_notes?: string | null;
  delivery_notes?: string | null;
}

export interface UpdateDeliveryAssignmentRouteInput {
  origin_address?: string | null;
  destination_address?: string | null;

  origin_latitude?: number | null;
  origin_longitude?: number | null;
  destination_latitude?: number | null;
  destination_longitude?: number | null;

  distance_km?: number | null;
  estimated_duration_minutes?: number | null;
  estimated_arrival_at?: string | null;

  assignment_notes?: string | null;
  delivery_notes?: string | null;
}

interface RawDeliveryAssignment {
  id: number | string;
  order_id: number | string;
  driver_id: number | string;

  status: string | null;

  assigned_at: string;
  accepted_at: string | null;
  preparation_completed_at: string | null;
  picked_up_at: string | null;
  started_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  estimated_arrival_at: string | null;

  origin_address: string | null;
  destination_address: string | null;

  origin_latitude: number | string | null;
  origin_longitude: number | string | null;
  destination_latitude: number | string | null;
  destination_longitude: number | string | null;

  distance_km: number | string | null;
  estimated_duration_minutes: number | string | null;

  assignment_notes: string | null;
  delivery_notes: string | null;
  cancellation_reason: string | null;
  proof_of_delivery_url: string | null;

  created_at: string;
  updated_at: string;

  delivery_drivers?:
    | DeliveryAssignmentDriver
    | DeliveryAssignmentDriver[]
    | null;

  orders?:
    | DeliveryAssignmentOrder
    | DeliveryAssignmentOrder[]
    | null;
}

const ACTIVE_ASSIGNMENT_STATUSES: DeliveryAssignmentStatus[] = [
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

function cleanOptionalText(
  value: string | null | undefined
): string | null {
  const cleanValue = value?.trim() ?? "";
  return cleanValue || null;
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

function validatePositiveId(
  value: number,
  fieldName: string
): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(
      `El identificador de ${fieldName} no es válido.`
    );
  }

  return value;
}

function validateAssignmentStatus(
  status: DeliveryAssignmentStatus
): DeliveryAssignmentStatus {
  if (!DELIVERY_ASSIGNMENT_STATUSES.includes(status)) {
    throw new Error(
      "El estado de la asignación no es válido."
    );
  }

  return status;
}

function validateNonNegativeNumber(
  value: number | null | undefined,
  fieldName: string
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(
      `${fieldName} debe ser un valor mayor o igual a cero.`
    );
  }

  return value;
}

function normalizeAssignmentStatus(
  value: string | null | undefined
): DeliveryAssignmentStatus {
  const status = value?.trim() ?? "";

  if (
    DELIVERY_ASSIGNMENT_STATUSES.includes(
      status as DeliveryAssignmentStatus
    )
  ) {
    return status as DeliveryAssignmentStatus;
  }

  return "Asignado";
}

function normalizeAssignment(
  assignment: RawDeliveryAssignment
): DeliveryAssignment {
  return {
    id: Number(assignment.id),
    order_id: Number(assignment.order_id),
    driver_id: Number(assignment.driver_id),

    status: normalizeAssignmentStatus(
      assignment.status
    ),

    assigned_at: assignment.assigned_at,
    accepted_at: assignment.accepted_at,
    preparation_completed_at:
      assignment.preparation_completed_at,
    picked_up_at: assignment.picked_up_at,
    started_at: assignment.started_at,
    delivered_at: assignment.delivered_at,
    cancelled_at: assignment.cancelled_at,
    estimated_arrival_at:
      assignment.estimated_arrival_at,

    origin_address: cleanOptionalText(
      assignment.origin_address
    ),

    destination_address: cleanOptionalText(
      assignment.destination_address
    ),

    origin_latitude: toNullableNumber(
      assignment.origin_latitude
    ),

    origin_longitude: toNullableNumber(
      assignment.origin_longitude
    ),

    destination_latitude: toNullableNumber(
      assignment.destination_latitude
    ),

    destination_longitude: toNullableNumber(
      assignment.destination_longitude
    ),

    distance_km: toNullableNumber(
      assignment.distance_km
    ),

    estimated_duration_minutes:
      toNullableNumber(
        assignment.estimated_duration_minutes
      ),

    assignment_notes: cleanOptionalText(
      assignment.assignment_notes
    ),

    delivery_notes: cleanOptionalText(
      assignment.delivery_notes
    ),

    cancellation_reason: cleanOptionalText(
      assignment.cancellation_reason
    ),

    proof_of_delivery_url: cleanOptionalText(
      assignment.proof_of_delivery_url
    ),

    created_at: assignment.created_at,
    updated_at: assignment.updated_at,
  };
}

function normalizeSingleRelation<T>(
  relation: T | T[] | null | undefined
): T | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function normalizeAssignmentWithRelations(
  assignment: RawDeliveryAssignment
): DeliveryAssignmentWithRelations {
  return {
    ...normalizeAssignment(assignment),

    delivery_drivers:
      normalizeSingleRelation(
        assignment.delivery_drivers
      ),

    orders:
      normalizeSingleRelation(
        assignment.orders
      ),
  };
}

function getDatabaseErrorMessage(
  error: {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  },
  defaultMessage: string
): string {
  const errorText = `${error.message ?? ""} ${
    error.details ?? ""
  }`.toLowerCase();

  if (error.code === "23505") {
    if (
      errorText.includes(
        "idx_delivery_assignments_one_active_per_order"
      ) ||
      errorText.includes("order_id")
    ) {
      return "Este pedido ya tiene una asignación de entrega activa.";
    }

    if (
      errorText.includes(
        "idx_delivery_assignments_one_active_per_driver"
      ) ||
      errorText.includes("driver_id")
    ) {
      return "Este repartidor ya tiene una entrega activa.";
    }

    return "La asignación no pudo registrarse porque existe un conflicto con otra asignación activa.";
  }

  if (error.code === "23503") {
    if (errorText.includes("driver")) {
      return "El repartidor seleccionado no existe o ya no está disponible.";
    }

    if (errorText.includes("order")) {
      return "El pedido seleccionado no existe.";
    }

    return "La asignación contiene una referencia que ya no existe.";
  }

  if (error.code === "23514") {
    return "Uno de los valores ingresados no cumple las reglas del Centro Delivery.";
  }

  if (error.code === "42501") {
    return "No tienes permisos para realizar esta operación logística.";
  }

  return error.message || defaultMessage;
}

function logSupabaseError(
  context: string,
  error: {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  }
) {
  console.error(context, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
}

function prepareCreatePayload(
  input: CreateDeliveryAssignmentInput
) {
  const orderId = validatePositiveId(
    input.order_id,
    "pedido"
  );

  const driverId = validatePositiveId(
    input.driver_id,
    "repartidor"
  );

  const distanceKm = validateNonNegativeNumber(
    input.distance_km,
    "La distancia"
  );

  const estimatedDurationMinutes =
    validateNonNegativeNumber(
      input.estimated_duration_minutes,
      "La duración estimada"
    );

  return {
    order_id: orderId,
    driver_id: driverId,
    status: "Asignado" as const,

    origin_address: cleanOptionalText(
      input.origin_address
    ),

    destination_address: cleanOptionalText(
      input.destination_address
    ),

    origin_latitude: toNullableNumber(
      input.origin_latitude
    ),

    origin_longitude: toNullableNumber(
      input.origin_longitude
    ),

    destination_latitude: toNullableNumber(
      input.destination_latitude
    ),

    destination_longitude: toNullableNumber(
      input.destination_longitude
    ),

    distance_km: distanceKm,

    estimated_duration_minutes:
      estimatedDurationMinutes === null
        ? null
        : Math.round(estimatedDurationMinutes),

    estimated_arrival_at:
      input.estimated_arrival_at ?? null,

    assignment_notes: cleanOptionalText(
      input.assignment_notes
    ),

    delivery_notes: cleanOptionalText(
      input.delivery_notes
    ),
  };
}

export function isActiveDeliveryAssignmentStatus(
  status: DeliveryAssignmentStatus
): boolean {
  return ACTIVE_ASSIGNMENT_STATUSES.includes(status);
}

export async function getDeliveryAssignments(): Promise<
  DeliveryAssignmentWithRelations[]
> {
  const { data, error } = await supabase
    .from("delivery_assignments")
    .select(ASSIGNMENT_WITH_RELATIONS_SELECT)
    .order("assigned_at", {
      ascending: false,
    });

  if (error) {
    logSupabaseError(
      "Error cargando asignaciones de entrega:",
      error
    );

    throw new Error(
      getDatabaseErrorMessage(
        error,
        "No fue posible cargar las asignaciones de entrega."
      )
    );
  }

  return ((data ?? []) as unknown as RawDeliveryAssignment[]).map(
    normalizeAssignmentWithRelations
  );
}

export async function getActiveDeliveryAssignments(): Promise<
  DeliveryAssignmentWithRelations[]
> {
  const { data, error } = await supabase
    .from("delivery_assignments")
    .select(ASSIGNMENT_WITH_RELATIONS_SELECT)
    .in("status", ACTIVE_ASSIGNMENT_STATUSES)
    .order("assigned_at", {
      ascending: false,
    });

  if (error) {
    logSupabaseError(
      "Error cargando asignaciones activas:",
      error
    );

    throw new Error(
      getDatabaseErrorMessage(
        error,
        "No fue posible cargar las asignaciones activas."
      )
    );
  }

  return ((data ?? []) as unknown as RawDeliveryAssignment[]).map(
    normalizeAssignmentWithRelations
  );
}

export async function getDeliveryAssignmentById(
  assignmentId: number
): Promise<DeliveryAssignmentWithRelations> {
  const id = validatePositiveId(
    assignmentId,
    "asignación"
  );

  const { data, error } = await supabase
    .from("delivery_assignments")
    .select(ASSIGNMENT_WITH_RELATIONS_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    logSupabaseError(
      "Error cargando asignación:",
      error
    );

    throw new Error(
      getDatabaseErrorMessage(
        error,
        "No fue posible cargar la asignación de entrega."
      )
    );
  }

  if (!data) {
    throw new Error(
      "La asignación solicitada no existe."
    );
  }

  return normalizeAssignmentWithRelations(
    data as unknown as RawDeliveryAssignment
  );
}

export async function getActiveDeliveryAssignmentByOrder(
  orderId: number
): Promise<DeliveryAssignmentWithRelations | null> {
  const id = validatePositiveId(
    orderId,
    "pedido"
  );

  const { data, error } = await supabase
    .from("delivery_assignments")
    .select(ASSIGNMENT_WITH_RELATIONS_SELECT)
    .eq("order_id", id)
    .in("status", ACTIVE_ASSIGNMENT_STATUSES)
    .maybeSingle();

  if (error) {
    logSupabaseError(
      "Error cargando asignación activa del pedido:",
      error
    );

    throw new Error(
      getDatabaseErrorMessage(
        error,
        "No fue posible verificar la asignación activa del pedido."
      )
    );
  }

  return data
    ? normalizeAssignmentWithRelations(
        data as unknown as RawDeliveryAssignment
      )
    : null;
}

export async function getActiveDeliveryAssignmentByDriver(
  driverId: number
): Promise<DeliveryAssignmentWithRelations | null> {
  const id = validatePositiveId(
    driverId,
    "repartidor"
  );

  const { data, error } = await supabase
    .from("delivery_assignments")
    .select(ASSIGNMENT_WITH_RELATIONS_SELECT)
    .eq("driver_id", id)
    .in("status", ACTIVE_ASSIGNMENT_STATUSES)
    .maybeSingle();

  if (error) {
    logSupabaseError(
      "Error cargando asignación activa del repartidor:",
      error
    );

    throw new Error(
      getDatabaseErrorMessage(
        error,
        "No fue posible verificar la disponibilidad del repartidor."
      )
    );
  }

  return data
    ? normalizeAssignmentWithRelations(
        data as unknown as RawDeliveryAssignment
      )
    : null;
}

export async function getDeliveryAssignmentHistoryByOrder(
  orderId: number
): Promise<DeliveryAssignmentWithRelations[]> {
  const id = validatePositiveId(
    orderId,
    "pedido"
  );

  const { data, error } = await supabase
    .from("delivery_assignments")
    .select(ASSIGNMENT_WITH_RELATIONS_SELECT)
    .eq("order_id", id)
    .order("assigned_at", {
      ascending: false,
    });

  if (error) {
    logSupabaseError(
      "Error cargando historial del pedido:",
      error
    );

    throw new Error(
      getDatabaseErrorMessage(
        error,
        "No fue posible cargar el historial logístico del pedido."
      )
    );
  }

  return ((data ?? []) as unknown as RawDeliveryAssignment[]).map(
    normalizeAssignmentWithRelations
  );
}

export async function getDeliveryAssignmentHistoryByDriver(
  driverId: number
): Promise<DeliveryAssignmentWithRelations[]> {
  const id = validatePositiveId(
    driverId,
    "repartidor"
  );

  const { data, error } = await supabase
    .from("delivery_assignments")
    .select(ASSIGNMENT_WITH_RELATIONS_SELECT)
    .eq("driver_id", id)
    .order("assigned_at", {
      ascending: false,
    });

  if (error) {
    logSupabaseError(
      "Error cargando historial del repartidor:",
      error
    );

    throw new Error(
      getDatabaseErrorMessage(
        error,
        "No fue posible cargar el historial del repartidor."
      )
    );
  }

  return ((data ?? []) as unknown as RawDeliveryAssignment[]).map(
    normalizeAssignmentWithRelations
  );
}

export async function createDeliveryAssignment(
  input: CreateDeliveryAssignmentInput
): Promise<DeliveryAssignmentWithRelations> {
  const payload = prepareCreatePayload(input);

  const [
    existingOrderAssignment,
    existingDriverAssignment,
  ] = await Promise.all([
    getActiveDeliveryAssignmentByOrder(
      payload.order_id
    ),
    getActiveDeliveryAssignmentByDriver(
      payload.driver_id
    ),
  ]);

  if (existingOrderAssignment) {
    throw new Error(
      "Este pedido ya tiene una asignación de entrega activa."
    );
  }

  if (existingDriverAssignment) {
    throw new Error(
      "Este repartidor ya tiene una entrega activa."
    );
  }

  const { data, error } = await supabase
    .from("delivery_assignments")
    .insert(payload)
    .select(ASSIGNMENT_WITH_RELATIONS_SELECT)
    .single();

  if (error) {
    logSupabaseError(
      "Error creando asignación de entrega:",
      error
    );

    throw new Error(
      getDatabaseErrorMessage(
        error,
        "No fue posible asignar el pedido al repartidor."
      )
    );
  }

  if (!data) {
    throw new Error(
      "Supabase no devolvió la asignación creada."
    );
  }

  return normalizeAssignmentWithRelations(
    data as unknown as RawDeliveryAssignment
  );
}

export async function updateDeliveryAssignmentRoute(
  assignmentId: number,
  input: UpdateDeliveryAssignmentRouteInput
): Promise<DeliveryAssignmentWithRelations> {
  const id = validatePositiveId(
    assignmentId,
    "asignación"
  );

  const distanceKm = validateNonNegativeNumber(
    input.distance_km,
    "La distancia"
  );

  const estimatedDurationMinutes =
    validateNonNegativeNumber(
      input.estimated_duration_minutes,
      "La duración estimada"
    );

  const payload = {
    origin_address: cleanOptionalText(
      input.origin_address
    ),

    destination_address: cleanOptionalText(
      input.destination_address
    ),

    origin_latitude: toNullableNumber(
      input.origin_latitude
    ),

    origin_longitude: toNullableNumber(
      input.origin_longitude
    ),

    destination_latitude: toNullableNumber(
      input.destination_latitude
    ),

    destination_longitude: toNullableNumber(
      input.destination_longitude
    ),

    distance_km: distanceKm,

    estimated_duration_minutes:
      estimatedDurationMinutes === null
        ? null
        : Math.round(estimatedDurationMinutes),

    estimated_arrival_at:
      input.estimated_arrival_at ?? null,

    assignment_notes: cleanOptionalText(
      input.assignment_notes
    ),

    delivery_notes: cleanOptionalText(
      input.delivery_notes
    ),
  };

  const { data, error } = await supabase
    .from("delivery_assignments")
    .update(payload)
    .eq("id", id)
    .select(ASSIGNMENT_WITH_RELATIONS_SELECT)
    .single();

  if (error) {
    logSupabaseError(
      "Error actualizando ruta de entrega:",
      error
    );

    throw new Error(
      getDatabaseErrorMessage(
        error,
        "No fue posible actualizar la información de la ruta."
      )
    );
  }

  if (!data) {
    throw new Error(
      "No se encontró la asignación que deseas actualizar."
    );
  }

  return normalizeAssignmentWithRelations(
    data as unknown as RawDeliveryAssignment
  );
}

export async function updateDeliveryAssignmentStatus(
  assignmentId: number,
  status: DeliveryAssignmentStatus
): Promise<DeliveryAssignmentWithRelations> {
  const id = validatePositiveId(
    assignmentId,
    "asignación"
  );

  const nextStatus = validateAssignmentStatus(
    status
  );

  const now = new Date().toISOString();

  const payload: Record<string, string | null> = {
    status: nextStatus,
  };

  if (nextStatus === "Aceptado") {
    payload.accepted_at = now;
  }

  if (nextStatus === "Preparando retiro") {
    payload.preparation_completed_at = null;
  }

  if (nextStatus === "Pedido retirado") {
    payload.preparation_completed_at = now;
    payload.picked_up_at = now;
  }

  if (nextStatus === "En ruta") {
    payload.started_at = now;
  }

  if (nextStatus === "Entregado") {
    payload.delivered_at = now;
    payload.cancelled_at = null;
    payload.cancellation_reason = null;
  }

  if (nextStatus === "Cancelado") {
    payload.cancelled_at = now;
  }

  const { data, error } = await supabase
    .from("delivery_assignments")
    .update(payload)
    .eq("id", id)
    .select(ASSIGNMENT_WITH_RELATIONS_SELECT)
    .single();

  if (error) {
    logSupabaseError(
      "Error actualizando estado de asignación:",
      error
    );

    throw new Error(
      getDatabaseErrorMessage(
        error,
        "No fue posible actualizar el estado de la entrega."
      )
    );
  }

  if (!data) {
    throw new Error(
      "No se encontró la asignación que deseas actualizar."
    );
  }

  return normalizeAssignmentWithRelations(
    data as unknown as RawDeliveryAssignment
  );
}

export async function acceptDeliveryAssignment(
  assignmentId: number
): Promise<DeliveryAssignmentWithRelations> {
  return updateDeliveryAssignmentStatus(
    assignmentId,
    "Aceptado"
  );
}

export async function markDeliveryPreparingPickup(
  assignmentId: number
): Promise<DeliveryAssignmentWithRelations> {
  return updateDeliveryAssignmentStatus(
    assignmentId,
    "Preparando retiro"
  );
}

export async function markDeliveryPickedUp(
  assignmentId: number
): Promise<DeliveryAssignmentWithRelations> {
  return updateDeliveryAssignmentStatus(
    assignmentId,
    "Pedido retirado"
  );
}

export async function startDeliveryRoute(
  assignmentId: number
): Promise<DeliveryAssignmentWithRelations> {
  return updateDeliveryAssignmentStatus(
    assignmentId,
    "En ruta"
  );
}

export async function completeDeliveryAssignment(
  assignmentId: number,
  input?: {
    delivery_notes?: string | null;
    proof_of_delivery_url?: string | null;
  }
): Promise<DeliveryAssignmentWithRelations> {
  const id = validatePositiveId(
    assignmentId,
    "asignación"
  );

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("delivery_assignments")
    .update({
      status: "Entregado",
      delivered_at: now,
      cancelled_at: null,
      cancellation_reason: null,
      delivery_notes: cleanOptionalText(
        input?.delivery_notes
      ),
      proof_of_delivery_url: cleanOptionalText(
        input?.proof_of_delivery_url
      ),
    })
    .eq("id", id)
    .select(ASSIGNMENT_WITH_RELATIONS_SELECT)
    .single();

  if (error) {
    logSupabaseError(
      "Error completando entrega:",
      error
    );

    throw new Error(
      getDatabaseErrorMessage(
        error,
        "No fue posible completar la entrega."
      )
    );
  }

  if (!data) {
    throw new Error(
      "No se encontró la asignación que deseas completar."
    );
  }

  return normalizeAssignmentWithRelations(
    data as unknown as RawDeliveryAssignment
  );
}

export async function cancelDeliveryAssignment(
  assignmentId: number,
  cancellationReason: string
): Promise<DeliveryAssignmentWithRelations> {
  const id = validatePositiveId(
    assignmentId,
    "asignación"
  );

  const reason = cleanOptionalText(
    cancellationReason
  );

  if (!reason) {
    throw new Error(
      "Debes registrar el motivo de cancelación."
    );
  }

  const { data, error } = await supabase
    .from("delivery_assignments")
    .update({
      status: "Cancelado",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    })
    .eq("id", id)
    .select(ASSIGNMENT_WITH_RELATIONS_SELECT)
    .single();

  if (error) {
    logSupabaseError(
      "Error cancelando asignación:",
      error
    );

    throw new Error(
      getDatabaseErrorMessage(
        error,
        "No fue posible cancelar la asignación."
      )
    );
  }

  if (!data) {
    throw new Error(
      "No se encontró la asignación que deseas cancelar."
    );
  }

  return normalizeAssignmentWithRelations(
    data as unknown as RawDeliveryAssignment
  );
}

export async function reassignDeliveryOrder(
  currentAssignmentId: number,
  newDriverId: number,
  cancellationReason: string,
  overrides?: Omit<
    CreateDeliveryAssignmentInput,
    "order_id" | "driver_id"
  >
): Promise<DeliveryAssignmentWithRelations> {
  const currentAssignment =
    await getDeliveryAssignmentById(
      currentAssignmentId
    );

  if (
    currentAssignment.status === "Entregado" ||
    currentAssignment.status === "Cancelado"
  ) {
    throw new Error(
      "Esta asignación ya está cerrada y no puede reasignarse."
    );
  }

  const driverId = validatePositiveId(
    newDriverId,
    "repartidor"
  );

  if (driverId === currentAssignment.driver_id) {
    throw new Error(
      "Selecciona un repartidor diferente para realizar la reasignación."
    );
  }

  await cancelDeliveryAssignment(
    currentAssignment.id,
    cancellationReason
  );

  return createDeliveryAssignment({
    order_id: currentAssignment.order_id,
    driver_id: driverId,

    origin_address:
      overrides?.origin_address ??
      currentAssignment.origin_address,

    destination_address:
      overrides?.destination_address ??
      currentAssignment.destination_address,

    origin_latitude:
      overrides?.origin_latitude ??
      currentAssignment.origin_latitude,

    origin_longitude:
      overrides?.origin_longitude ??
      currentAssignment.origin_longitude,

    destination_latitude:
      overrides?.destination_latitude ??
      currentAssignment.destination_latitude,

    destination_longitude:
      overrides?.destination_longitude ??
      currentAssignment.destination_longitude,

    distance_km:
      overrides?.distance_km ??
      currentAssignment.distance_km,

    estimated_duration_minutes:
      overrides?.estimated_duration_minutes ??
      currentAssignment.estimated_duration_minutes,

    estimated_arrival_at:
      overrides?.estimated_arrival_at ??
      currentAssignment.estimated_arrival_at,

    assignment_notes:
      overrides?.assignment_notes ??
      currentAssignment.assignment_notes,

    delivery_notes:
      overrides?.delivery_notes ??
      currentAssignment.delivery_notes,
  });
}