import { supabase } from "@/lib/supabase";

export interface OrderData {
  customer_id: number;
  subtotal: number;
  delivery: number;
  total: number;
  payment_method: string;
  status?: string;
}

export async function createOrder(order: OrderData) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_id: order.customer_id,
      subtotal: order.subtotal,
      delivery: order.delivery,
      total: order.total,
      payment_method: order.payment_method,
      status: order.status ?? "Pendiente",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creando pedido:", error);
    throw error;
  }

  return data;
}