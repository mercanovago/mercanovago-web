import { supabase } from "@/lib/supabase";

export async function getLocroRecipeProducts() {
  const names = ["Papa Chola", "Queso Fresco", "Aguacate", "Cebolla Colorada"];

  const { data, error } = await supabase
    .from("products")
    .select("id,name,image,price,unit")
    .in("name", names);

  if (error) {
    console.error(error);
    throw error;
  }

  return data ?? [];
}