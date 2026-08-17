import { supabase } from "@/lib/supabase";

export type DeliveryType = "express" | "scheduled" | "coordinated";

export type DeliveryStatus =
  | "Pendiente"
  | "Por coordinar"
  | "Programada"
  | "Confirmada"
  | "Preparando"
  | "Lista para entrega"
  | "En camino"
  | "Entregada"
  | "Cancelada";

export interface OrderData {
  customer_id: number;
  subtotal: number;
  delivery: number;
  total: number;
  payment_method: string;
  status?: string;

  delivery_type?: DeliveryType;
  delivery_date?: string | null;
  delivery_time?: string | null;
  delivery_window?: string | null;
  estimated_delivery?: string | null;
  delivery_notes?: string | null;
  delivery_status?: DeliveryStatus;
}

export async function createOrder(order: OrderData) {
  const deliveryType = order.delivery_type ?? "express";

  const defaultDeliveryStatus: DeliveryStatus =
    deliveryType === "scheduled"
      ? "Programada"
      : deliveryType === "coordinated"
        ? "Por coordinar"
        : "Pendiente";

  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_id: order.customer_id,
      subtotal: order.subtotal,
      delivery: order.delivery,
      total: order.total,
      payment_method: order.payment_method,
      status: order.status ?? "Pendiente",

      delivery_type: deliveryType,
      delivery_date: order.delivery_date ?? null,
      delivery_time: order.delivery_time ?? null,
      delivery_window: order.delivery_window ?? null,
      estimated_delivery: order.estimated_delivery ?? null,
      delivery_notes: order.delivery_notes?.trim() || null,
      delivery_status: order.delivery_status ?? defaultDeliveryStatus,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creando pedido:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(
      error.message || "No se pudo registrar el pedido en MercaNova GO."
    );
  }

  return data;
}