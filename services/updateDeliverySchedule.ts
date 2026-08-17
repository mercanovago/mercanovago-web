import { supabase } from "@/lib/supabase";

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

  if (scheduledDateTime.getTime() <= Date.now()) {
    throw new Error(
      "No es posible confirmar una fecha u hora vencida."
    );
  }

  const estimatedDelivery = createEstimatedDelivery(
    schedule.deliveryDate,
    schedule.deliveryTime
  );

  const { data, error } = await supabase
    .from("orders")
    .update({
      delivery_date: schedule.deliveryDate,
      delivery_time: schedule.deliveryTime,
      delivery_window: schedule.deliveryWindow,
      estimated_delivery: estimatedDelivery,
      delivery_notes:
        schedule.deliveryNotes?.trim() || null,
      delivery_status: "Confirmada",
    })
    .eq("id", schedule.orderId)
    .select(`
      id,
      delivery_date,
      delivery_time,
      delivery_window,
      estimated_delivery,
      delivery_notes,
      delivery_status
    `)
    .single();

  if (error) {
    console.error(
      "Error confirmando programación de entrega:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    throw new Error(
      "No fue posible confirmar la fecha y hora de entrega."
    );
  }

  if (!data) {
    throw new Error(
      "Supabase no devolvió la entrega actualizada."
    );
  }

  return {
    id: Number(data.id),
    delivery_date: String(data.delivery_date),
    delivery_time: String(data.delivery_time),
    delivery_window: String(data.delivery_window),
    estimated_delivery: String(
      data.estimated_delivery
    ),
    delivery_notes:
      typeof data.delivery_notes === "string"
        ? data.delivery_notes
        : null,
    delivery_status: "Confirmada",
  };
}