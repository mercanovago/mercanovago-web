import { supabase } from "@/lib/supabase";

export interface OrderItemData {
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export async function createOrderItems(items: OrderItemData[]) {
  const { data, error } = await supabase
    .from("order_items")
    .insert(items)
    .select();

  if (error) {
    console.error("Error creando detalle del pedido:", error);
    throw error;
  }

  return data;
}