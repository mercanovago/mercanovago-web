import { supabase } from "@/lib/supabase";

import type {
  AdminProductRecord,
} from "@/types/adminProduct";

export interface GetAdminProductsOptions {
  search?: string;
  category?: string;
  stock?: boolean;
  featured?: boolean;
  limit?: number;
}

function normalizeSearch(
  value: string | undefined
): string {
  return value?.trim() ?? "";
}

function normalizeCategory(
  value: string | undefined
): string {
  return value?.trim() ?? "";
}

function normalizeLimit(
  value: number | undefined
): number | null {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const normalizedValue =
    Math.trunc(Number(value));

  if (
    !Number.isFinite(normalizedValue) ||
    normalizedValue <= 0
  ) {
    return null;
  }

  return Math.min(
    normalizedValue,
    1000
  );
}

export async function getAdminProducts(
  options: GetAdminProductsOptions = {}
): Promise<AdminProductRecord[]> {
  const search =
    normalizeSearch(options.search);

  const category =
    normalizeCategory(
      options.category
    );

  const limit =
    normalizeLimit(options.limit);

  let query = supabase
    .from("products")
    .select(
      `
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
        origin,
        delivery,
        badge,
        stock,
        featured,
        created_at
      `
    )
    .order("created_at", {
      ascending: false,
    })
    .order("name", {
      ascending: true,
    });

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,category.ilike.%${search}%,slug.ilike.%${search}%`
    );
  }

  if (category) {
    query = query.eq(
      "category",
      category
    );
  }

  if (
    typeof options.stock ===
    "boolean"
  ) {
    query = query.eq(
      "stock",
      options.stock
    );
  }

  if (
    typeof options.featured ===
    "boolean"
  ) {
    query = query.eq(
      "featured",
      options.featured
    );
  }

  if (limit !== null) {
    query = query.limit(limit);
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    console.error(
      "Error consultando los productos administrativos:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible cargar los productos administrativos."
    );
  }

  return (
    data ?? []
  ) as AdminProductRecord[];
}

export async function getAdminProductById(
  id: number
): Promise<AdminProductRecord | null> {
  const productId = Number(id);

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error(
      "El identificador del producto no es válido."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(
      `
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
        origin,
        delivery,
        badge,
        stock,
        featured,
        created_at
      `
    )
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    console.error(
      "Error consultando el producto administrativo:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible cargar el producto administrativo."
    );
  }

  if (!data) {
    return null;
  }

  return data as AdminProductRecord;
}

export async function getAdminProductCategories(): Promise<
  string[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null)
    .order("category", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error consultando las categorías administrativas:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible cargar las categorías del catálogo."
    );
  }

  const categories = new Set<string>();

  for (const row of data ?? []) {
    const category =
      typeof row.category ===
      "string"
        ? row.category.trim()
        : "";

    if (category) {
      categories.add(category);
    }
  }

  return Array.from(categories);
}