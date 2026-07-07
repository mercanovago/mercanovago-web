import { supabase } from "@/lib/supabase";

export async function getAdminCustomers() {
  const { data, error } = await supabase
    .from("customers")
    .select(`
      id,
      first_name,
      last_name,
      phone,
      email,
      address,
      created_at,
      orders (
        id,
        total,
        status,
        created_at
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando clientes:", error);
    return [];
  }

  return data ?? [];
}