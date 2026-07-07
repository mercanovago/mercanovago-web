import { supabase } from "@/lib/supabase";

export async function updateOrderStatus(id: number, status: string) {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error actualizando estado:", error);
    throw error;
  }
}