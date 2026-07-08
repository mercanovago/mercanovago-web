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
    .select("total,status");

  const totalOrders = orders?.length ?? 0;

  const totalSales =
    orders?.reduce((sum, order) => sum + Number(order.total), 0) ?? 0;

  const averageTicket =
    totalOrders > 0 ? totalSales / totalOrders : 0;

  const pending =
    orders?.filter((o) => o.status === "Pendiente").length ?? 0;

  const preparing =
    orders?.filter((o) => o.status === "Preparando").length ?? 0;

  const onWay =
    orders?.filter((o) => o.status === "En camino").length ?? 0;

  const delivered =
    orders?.filter((o) => o.status === "Entregado").length ?? 0;

  const cancelled =
    orders?.filter((o) => o.status === "Cancelado").length ?? 0;

  return {
    products: products ?? 0,
    customers: customers ?? 0,
    orders: totalOrders,
    sales: totalSales,
    averageTicket,
    pending,
    preparing,
    onWay,
    delivered,
    cancelled,
  };
}