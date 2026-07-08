import { supabase } from "@/lib/supabase";

export async function getDashboardStats() {
  // Productos
  const { count: products } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  // Clientes
  const { count: customers } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });

  // Pedidos
  const { data: orders } = await supabase
    .from("orders")
    .select("total");

  const totalOrders = orders?.length ?? 0;

  const totalSales =
    orders?.reduce((acc, item) => acc + Number(item.total), 0) ?? 0;

  return {
    products: products ?? 0,
    customers: customers ?? 0,
    orders: totalOrders,
    sales: totalSales,
  };
}