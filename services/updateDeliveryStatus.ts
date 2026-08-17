import { supabase } from "@/lib/supabase";

import {
  DELIVERY_STATUSES,
  type AdminDeliveryStatus,
} from "@/services/adminOrders";

export interface UpdatedDeliveryStatus {
  id: number;
  delivery_status: AdminDeliveryStatus;
}

function isValidDeliveryStatus(
  status: string
): status is AdminDeliveryStatus {
  return DELIVERY_STATUSES.includes(
    status as AdminDeliveryStatus
  );
}

export async function updateDeliveryStatus(
  id: number,
  deliveryStatus: string
): Promise<UpdatedDeliveryStatus> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "El identificador del pedido no es válido."
    );
  }

  if (!isValidDeliveryStatus(deliveryStatus)) {
    throw new Error(
      "El estado logístico seleccionado no es válido."
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .update({
      delivery_status: deliveryStatus,
    })
    .eq("id", id)
    .select("id,delivery_status")
    .single();

  if (error) {
    console.error(
      "Error actualizando estado logístico:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    throw new Error(
      "No fue posible actualizar el estado logístico del pedido."
    );
  }

  if (!data) {
    throw new Error(
      "Supabase no devolvió el pedido actualizado."
    );
  }

  return {
    id: Number(data.id),
    delivery_status:
      data.delivery_status as AdminDeliveryStatus,
  };
}