import { supabase } from "@/lib/supabase";

export interface CreateProductData {
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

function createSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProduct(data: CreateProductData) {
  const slug = `${createSlug(data.name)}-${Date.now()}`;

  const { data: product, error } = await supabase
    .from("products")
    .insert([
      {
        slug,
        name: data.name,
        category: data.category,
        price: data.price,
        old_price: data.old_price,
        image: data.image,
        unit: data.unit,
        approx: data.approx,
        stock: data.stock,
        featured: data.featured,
        badge: data.featured ? "Nuevo" : "Disponible",
        delivery: "20-25 min",
        description: data.description,
        origin: "Mercado Mayorista de Riobamba",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creando producto:", error);
    throw error;
  }

  return product;
}