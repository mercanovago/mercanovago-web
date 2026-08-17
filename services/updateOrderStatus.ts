import { supabase } from "@/lib/supabase";

import {
  ORDER_STATUSES,
  type OrderStatus,
} from "@/services/adminOrders";

export interface UpdatedOrderStatus {
  id: number;
  status: OrderStatus;
}

function isValidOrderStatus(
  status: string
): status is OrderStatus {
  return ORDER_STATUSES.includes(status as OrderStatus);
}

export async function updateOrderStatus(
  id: number,
  status: string
): Promise<UpdatedOrderStatus> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(
      "El identificador del pedido no es válido."
    );
  }

  if (!isValidOrderStatus(status)) {
    throw new Error(
      "El estado seleccionado no es válido."
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
    })
    .eq("id", id)
    .select("id,status")
    .single();

  if (error) {
    console.error(
      "Error actualizando estado del pedido:",
      error
    );

    throw new Error(
      "No fue posible actualizar el estado del pedido."
    );
  }

  if (!data) {
    throw new Error(
      "Supabase no devolvió el pedido actualizado."
    );
  }

  return {
    id: Number(data.id),
    status: data.status as OrderStatus,
  };
}