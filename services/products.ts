import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/product";

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error obteniendo productos:", error);
    return [];
  }

  return data ?? [];
}