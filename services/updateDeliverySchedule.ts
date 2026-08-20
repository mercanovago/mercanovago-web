import { getAdminSession } from "@/services/adminLogin";

export interface DeliveryScheduleData {
  orderId: number;
  deliveryDate: string;
  deliveryTime: string;
  deliveryWindow: string;
  deliveryNotes?: string | null;
}

export interface UpdatedDeliverySchedule {
  id: number;
  delivery_date: string;
  delivery_time: string;
  delivery_window: string;
  estimated_delivery: string;
  delivery_notes: string | null;
  delivery_status: "Confirmada";
}

interface UpdateDeliveryScheduleResponse {
  ok: boolean;
  data?: UpdatedDeliverySchedule;
  error?: string;
}

function validateDateValue(value: string): boolean {
  if (!value) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  return !Number.isNaN(date.getTime());
}

function validateTimeValue(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export async function updateDeliverySchedule(
  schedule: DeliveryScheduleData
): Promise<UpdatedDeliverySchedule> {
  if (
    !Number.isInteger(schedule.orderId) ||
    schedule.orderId <= 0
  ) {
    throw new Error(
      "El identificador del pedido no es válido."
    );
  }

  if (!validateDateValue(schedule.deliveryDate)) {
    throw new Error(
      "La fecha seleccionada no es válida."
    );
  }

  if (!validateTimeValue(schedule.deliveryTime)) {
    throw new Error(
      "La hora seleccionada no es válida."
    );
  }

  if (!schedule.deliveryWindow.trim()) {
    throw new Error(
      "El intervalo de entrega es obligatorio."
    );
  }

  const scheduledDateTime = new Date(
    `${schedule.deliveryDate}T${schedule.deliveryTime}:00`
  );

  if (
    Number.isNaN(scheduledDateTime.getTime()) ||
    scheduledDateTime.getTime() <= Date.now()
  ) {
    throw new Error(
      "No es posible confirmar una fecha u hora vencida."
    );
  }

  const session = await getAdminSession();

  if (!session?.accessToken) {
    throw new Error(
      "No existe una sesión administrativa válida."
    );
  }

  const response = await fetch(
    "/api/admin/orders",
    {
      method: "PATCH",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization:
          `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        id: schedule.orderId,
        delivery_schedule: {
          delivery_date:
            schedule.deliveryDate,
          delivery_time:
            schedule.deliveryTime,
          delivery_window:
            schedule.deliveryWindow.trim(),
          delivery_notes:
            schedule.deliveryNotes?.trim() ||
            null,
        },
      }),
    }
  );

  let result: UpdateDeliveryScheduleResponse;

  try {
    result =
      (await response.json()) as
        UpdateDeliveryScheduleResponse;
  } catch {
    throw new Error(
      "La respuesta del servidor no es válida."
    );
  }

  if (!response.ok || !result.ok) {
    console.error(
      "Error confirmando programación de entrega:",
      result.error ??
        `HTTP ${response.status}`
    );

    throw new Error(
      result.error ??
        "No fue posible confirmar la fecha y hora de entrega."
    );
  }

  if (!result.data) {
    throw new Error(
      "El servidor no devolvió la entrega actualizada."
    );
  }

  return result.data;
}