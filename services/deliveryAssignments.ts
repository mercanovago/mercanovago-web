import { getAdminSession } from "@/services/adminLogin";

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

interface DeliveryApiResponse {
  ok: boolean;
  data?: unknown;
  error?: string;
}

const ACTIVE_ASSIGNMENT_STATUSES: DeliveryAssignmentStatus[] = [
  "Asignado",
  "Aceptado",
  "Preparando retiro",
  "Pedido retirado",
  "En ruta",
];

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
  if (
    !DELIVERY_ASSIGNMENT_STATUSES.includes(
      status
    )
  ) {
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
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    throw new Error(
      `${fieldName} debe ser un valor mayor o igual a cero.`
    );
  }

  return value;
}

function normalizeAssignmentStatus(
  value: string | null | undefined
): DeliveryAssignmentStatus {
  const status =
    value?.trim() ?? "";

  if (
    DELIVERY_ASSIGNMENT_STATUSES.includes(
      status as DeliveryAssignmentStatus
    )
  ) {
    return status as DeliveryAssignmentStatus;
  }

  return "Asignado";
}

function normalizeSingleRelation<T>(
  relation:
    | T
    | T[]
    | null
    | undefined
): T | null {
  if (!relation) {
    return null;
  }

  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function normalizeAssignment(
  assignment: RawDeliveryAssignment
): DeliveryAssignment {
  return {
    id: Number(assignment.id),
    order_id: Number(
      assignment.order_id
    ),
    driver_id: Number(
      assignment.driver_id
    ),

    status:
      normalizeAssignmentStatus(
        assignment.status
      ),

    assigned_at:
      assignment.assigned_at,
    accepted_at:
      assignment.accepted_at,
    preparation_completed_at:
      assignment.preparation_completed_at,
    picked_up_at:
      assignment.picked_up_at,
    started_at:
      assignment.started_at,
    delivered_at:
      assignment.delivered_at,
    cancelled_at:
      assignment.cancelled_at,
    estimated_arrival_at:
      assignment.estimated_arrival_at,

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

    assignment_notes:
      cleanOptionalText(
        assignment.assignment_notes
      ),

    delivery_notes:
      cleanOptionalText(
        assignment.delivery_notes
      ),

    cancellation_reason:
      cleanOptionalText(
        assignment.cancellation_reason
      ),

    proof_of_delivery_url:
      cleanOptionalText(
        assignment.proof_of_delivery_url
      ),

    created_at:
      assignment.created_at,
    updated_at:
      assignment.updated_at,
  };
}

function normalizeAssignmentWithRelations(
  assignment: RawDeliveryAssignment
): DeliveryAssignmentWithRelations {
  return {
    ...normalizeAssignment(
      assignment
    ),

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

async function callDeliveryApi(
  options: {
    method?: "GET" | "POST" | "PATCH";
    query?: URLSearchParams;
    body?: Record<string, unknown>;
  } = {}
): Promise<unknown> {
  const accessToken =
    await getAccessToken();

  const query =
    options.query?.toString();

  const url = query
    ? `/api/admin/delivery/assignments?${query}`
    : "/api/admin/delivery/assignments";

  const response = await fetch(
    url,
    {
      method:
        options.method ?? "GET",
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
            body: JSON.stringify(
              options.body
            ),
          }
        : {}),
    }
  );

  let result:
    | DeliveryApiResponse
    | null = null;

  try {
    result =
      (await response.json()) as
        DeliveryApiResponse;
  } catch {
    result = null;
  }

  if (
    !response.ok ||
    !result?.ok
  ) {
    const message =
      result?.error ??
      `Error HTTP ${response.status}.`;

    throw new Error(message);
  }

  return result.data;
}

function prepareCreatePayload(
  input: CreateDeliveryAssignmentInput
) {
  const orderId =
    validatePositiveId(
      input.order_id,
      "pedido"
    );

  const driverId =
    validatePositiveId(
      input.driver_id,
      "repartidor"
    );

  const distanceKm =
    validateNonNegativeNumber(
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

    origin_address:
      cleanOptionalText(
        input.origin_address
      ),

    destination_address:
      cleanOptionalText(
        input.destination_address
      ),

    origin_latitude:
      toNullableNumber(
        input.origin_latitude
      ),

    origin_longitude:
      toNullableNumber(
        input.origin_longitude
      ),

    destination_latitude:
      toNullableNumber(
        input.destination_latitude
      ),

    destination_longitude:
      toNullableNumber(
        input.destination_longitude
      ),

    distance_km: distanceKm,

    estimated_duration_minutes:
      estimatedDurationMinutes === null
        ? null
        : Math.round(
            estimatedDurationMinutes
          ),

    estimated_arrival_at:
      input.estimated_arrival_at ??
      null,

    assignment_notes:
      cleanOptionalText(
        input.assignment_notes
      ),

    delivery_notes:
      cleanOptionalText(
        input.delivery_notes
      ),
  };
}

export function isActiveDeliveryAssignmentStatus(
  status: DeliveryAssignmentStatus
): boolean {
  return ACTIVE_ASSIGNMENT_STATUSES.includes(
    status
  );
}

export async function getDeliveryAssignments(): Promise<
  DeliveryAssignmentWithRelations[]
> {
  const query =
    new URLSearchParams({
      scope: "all",
    });

  const data =
    await callDeliveryApi({
      query,
    });

  return (
    (data ?? []) as RawDeliveryAssignment[]
  ).map(
    normalizeAssignmentWithRelations
  );
}

export async function getActiveDeliveryAssignments(): Promise<
  DeliveryAssignmentWithRelations[]
> {
  const query =
    new URLSearchParams({
      scope: "active",
    });

  const data =
    await callDeliveryApi({
      query,
    });

  return (
    (data ?? []) as RawDeliveryAssignment[]
  ).map(
    normalizeAssignmentWithRelations
  );
}

export async function getDeliveryAssignmentById(
  assignmentId: number
): Promise<DeliveryAssignmentWithRelations> {
  const id =
    validatePositiveId(
      assignmentId,
      "asignación"
    );

  const query =
    new URLSearchParams({
      scope: "id",
      id: String(id),
    });

  const data =
    await callDeliveryApi({
      query,
    });

  if (!data) {
    throw new Error(
      "La asignación solicitada no existe."
    );
  }

  return normalizeAssignmentWithRelations(
    data as RawDeliveryAssignment
  );
}

export async function getActiveDeliveryAssignmentByOrder(
  orderId: number
): Promise<DeliveryAssignmentWithRelations | null> {
  const id =
    validatePositiveId(
      orderId,
      "pedido"
    );

  const query =
    new URLSearchParams({
      scope: "active_order",
      orderId: String(id),
    });

  const data =
    await callDeliveryApi({
      query,
    });

  return data
    ? normalizeAssignmentWithRelations(
        data as RawDeliveryAssignment
      )
    : null;
}

export async function getActiveDeliveryAssignmentByDriver(
  driverId: number
): Promise<DeliveryAssignmentWithRelations | null> {
  const id =
    validatePositiveId(
      driverId,
      "repartidor"
    );

  const query =
    new URLSearchParams({
      scope: "active_driver",
      driverId: String(id),
    });

  const data =
    await callDeliveryApi({
      query,
    });

  return data
    ? normalizeAssignmentWithRelations(
        data as RawDeliveryAssignment
      )
    : null;
}

export async function getDeliveryAssignmentHistoryByOrder(
  orderId: number
): Promise<
  DeliveryAssignmentWithRelations[]
> {
  const id =
    validatePositiveId(
      orderId,
      "pedido"
    );

  const query =
    new URLSearchParams({
      scope: "history_order",
      orderId: String(id),
    });

  const data =
    await callDeliveryApi({
      query,
    });

  return (
    (data ?? []) as RawDeliveryAssignment[]
  ).map(
    normalizeAssignmentWithRelations
  );
}

export async function getDeliveryAssignmentHistoryByDriver(
  driverId: number
): Promise<
  DeliveryAssignmentWithRelations[]
> {
  const id =
    validatePositiveId(
      driverId,
      "repartidor"
    );

  const query =
    new URLSearchParams({
      scope: "history_driver",
      driverId: String(id),
    });

  const data =
    await callDeliveryApi({
      query,
    });

  return (
    (data ?? []) as RawDeliveryAssignment[]
  ).map(
    normalizeAssignmentWithRelations
  );
}

export async function createDeliveryAssignment(
  input: CreateDeliveryAssignmentInput
): Promise<DeliveryAssignmentWithRelations> {
  const payload =
    prepareCreatePayload(input);

  const data =
    await callDeliveryApi({
      method: "POST",
      body: {
        action: "create",
        assignment: payload,
      },
    });

  return normalizeAssignmentWithRelations(
    data as RawDeliveryAssignment
  );
}

export async function updateDeliveryAssignmentRoute(
  assignmentId: number,
  input: UpdateDeliveryAssignmentRouteInput
): Promise<DeliveryAssignmentWithRelations> {
  const id =
    validatePositiveId(
      assignmentId,
      "asignación"
    );

  const distanceKm =
    validateNonNegativeNumber(
      input.distance_km,
      "La distancia"
    );

  const estimatedDurationMinutes =
    validateNonNegativeNumber(
      input.estimated_duration_minutes,
      "La duración estimada"
    );

  const data =
    await callDeliveryApi({
      method: "PATCH",
      body: {
        action: "route",
        assignmentId: id,
        route: {
          origin_address:
            cleanOptionalText(
              input.origin_address
            ),
          destination_address:
            cleanOptionalText(
              input.destination_address
            ),
          origin_latitude:
            toNullableNumber(
              input.origin_latitude
            ),
          origin_longitude:
            toNullableNumber(
              input.origin_longitude
            ),
          destination_latitude:
            toNullableNumber(
              input.destination_latitude
            ),
          destination_longitude:
            toNullableNumber(
              input.destination_longitude
            ),
          distance_km:
            distanceKm,
          estimated_duration_minutes:
            estimatedDurationMinutes ===
            null
              ? null
              : Math.round(
                  estimatedDurationMinutes
                ),
          estimated_arrival_at:
            input.estimated_arrival_at ??
            null,
          assignment_notes:
            cleanOptionalText(
              input.assignment_notes
            ),
          delivery_notes:
            cleanOptionalText(
              input.delivery_notes
            ),
        },
      },
    });

  return normalizeAssignmentWithRelations(
    data as RawDeliveryAssignment
  );
}

export async function updateDeliveryAssignmentStatus(
  assignmentId: number,
  status: DeliveryAssignmentStatus
): Promise<DeliveryAssignmentWithRelations> {
  const id =
    validatePositiveId(
      assignmentId,
      "asignación"
    );

  const nextStatus =
    validateAssignmentStatus(
      status
    );

  const data =
    await callDeliveryApi({
      method: "PATCH",
      body: {
        action: "status",
        assignmentId: id,
        status: nextStatus,
      },
    });

  return normalizeAssignmentWithRelations(
    data as RawDeliveryAssignment
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
  const id =
    validatePositiveId(
      assignmentId,
      "asignación"
    );

  const data =
    await callDeliveryApi({
      method: "PATCH",
      body: {
        action: "complete",
        assignmentId: id,
        deliveryNotes:
          cleanOptionalText(
            input?.delivery_notes
          ),
        proofOfDeliveryUrl:
          cleanOptionalText(
            input?.proof_of_delivery_url
          ),
      },
    });

  return normalizeAssignmentWithRelations(
    data as RawDeliveryAssignment
  );
}

export async function cancelDeliveryAssignment(
  assignmentId: number,
  cancellationReason: string
): Promise<DeliveryAssignmentWithRelations> {
  const id =
    validatePositiveId(
      assignmentId,
      "asignación"
    );

  const reason =
    cleanOptionalText(
      cancellationReason
    );

  if (!reason) {
    throw new Error(
      "Debes registrar el motivo de cancelación."
    );
  }

  const data =
    await callDeliveryApi({
      method: "PATCH",
      body: {
        action: "cancel",
        assignmentId: id,
        cancellationReason:
          reason,
      },
    });

  return normalizeAssignmentWithRelations(
    data as RawDeliveryAssignment
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
  const assignmentId =
    validatePositiveId(
      currentAssignmentId,
      "asignación"
    );

  const driverId =
    validatePositiveId(
      newDriverId,
      "repartidor"
    );

  const reason =
    cleanOptionalText(
      cancellationReason
    );

  if (!reason) {
    throw new Error(
      "Debes registrar el motivo de reasignación."
    );
  }

  const data =
    await callDeliveryApi({
      method: "POST",
      body: {
        action: "reassign",
        assignmentId,
        newDriverId: driverId,
        cancellationReason:
          reason,
        overrides:
          overrides ?? null,
      },
    });

  return normalizeAssignmentWithRelations(
    data as RawDeliveryAssignment
  );
}