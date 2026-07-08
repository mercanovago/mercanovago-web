import { supabase } from "@/lib/supabase";

export async function deleteProduct(id: number) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error eliminando producto:", error);
    throw error;
  }

  return true;
}