import { supabase } from "@/lib/supabase";
import type { AdminProductRecord } from "@/types/adminProduct";

export async function getAdminProducts(): Promise<AdminProductRecord[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      slug,
      name,
      category,
      price,
      old_price,
      unit,
      approx,
      image,
      description,
      stock,
      featured,
      badge,
      delivery,
      origin,
      created_at
    `)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error cargando productos admin:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(
      "No fue posible cargar los productos del panel administrativo."
    );
  }

  return (data ?? []) as AdminProductRecord[];
}