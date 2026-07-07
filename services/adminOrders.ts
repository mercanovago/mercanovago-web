import { supabase } from "@/lib/supabase";

export async function getAdminOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      subtotal,
      delivery,
      total,
      payment_method,
      status,
      created_at,
      customers (
        first_name,
        last_name,
        phone,
        email,
        address
      ),
      order_items (
        id,
        quantity,
        unit_price,
        subtotal,
        products (
          name,
          image,
          unit
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando pedidos:", error);
    return [];
  }

  return data ?? [];
}