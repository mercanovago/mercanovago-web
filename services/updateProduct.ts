import { supabase } from "@/lib/supabase";

export interface UpdateProductData {
  id: number;

  name: string;
  category: string;

  price: number;
  old_price: number;

  unit: string;
  approx: string;

  image: string;

  description: string;

  stock: boolean;
  featured: boolean;
}

export async function updateProduct(data: UpdateProductData) {
  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      category: data.category,

      price: data.price,
      old_price: data.old_price,

      unit: data.unit,
      approx: data.approx,

      image: data.image,

      description: data.description,

      stock: data.stock,
      featured: data.featured,
    })
    .eq("id", data.id);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
}