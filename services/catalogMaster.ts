import { supabase } from "@/lib/supabase";

import type {
  CatalogCategory,
  CatalogFoundationSummary,
  CreateCatalogCategoryData,
  UpdateCatalogCategoryData,
} from "@/types/catalogMaster";

function normalizeRequiredText(
  value: string,
  fieldName: string
): string {
  const normalizedValue = value
    .trim()
    .replace(/\s+/g, " ");

  if (!normalizedValue) {
    throw new Error(
      `El campo ${fieldName} es obligatorio.`
    );
  }

  return normalizedValue;
}

function normalizeOptionalText(
  value: string | null | undefined
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value
    .trim()
    .replace(/\s+/g, " ");

  return normalizedValue || null;
}

function createSlug(
  value: string
): string {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    throw new Error(
      "No fue posible generar un slug válido para la categoría."
    );
  }

  return slug;
}

function normalizeDisplayOrder(
  value: number | undefined
): number {
  const normalizedValue = Number(value ?? 0);

  if (
    !Number.isFinite(normalizedValue) ||
    normalizedValue < 0
  ) {
    return 0;
  }

  return Math.trunc(normalizedValue);
}

async function ensureUniqueCategorySlug(
  slug: string,
  excludedId?: number
): Promise<void> {
  let query = supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .limit(1);

  if (
    excludedId !== undefined &&
    excludedId !== null
  ) {
    query = query.neq(
      "id",
      excludedId
    );
  }

  const { data, error } =
    await query;

  if (error) {
    console.error(
      "Error comprobando el slug de la categoría:",
      error
    );

    throw new Error(
      "No fue posible comprobar si la categoría ya existe."
    );
  }

  if ((data ?? []).length > 0) {
    throw new Error(
      `Ya existe una categoría con el slug "${slug}".`
    );
  }
}

export async function getCatalogCategories(
  includeInactive = true
): Promise<CatalogCategory[]> {
  let query = supabase
    .from("categories")
    .select("*")
    .order("display_order", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  if (!includeInactive) {
    query = query.eq(
      "active",
      true
    );
  }

  const { data, error } =
    await query;

  if (error) {
    console.error(
      "Error cargando las categorías maestras:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible cargar las categorías maestras."
    );
  }

  return (
    data ?? []
  ) as CatalogCategory[];
}

export async function createCatalogCategory(
  input: CreateCatalogCategoryData
): Promise<CatalogCategory> {
  const name =
    normalizeRequiredText(
      input.name,
      "nombre"
    );

  const slug = createSlug(
    input.slug || name
  );

  await ensureUniqueCategorySlug(
    slug
  );

  const payload = {
    parent_id:
      input.parent_id ?? null,
    name,
    slug,
    description:
      normalizeOptionalText(
        input.description
      ),
    icon:
      normalizeOptionalText(
        input.icon
      ),
    image_url:
      normalizeOptionalText(
        input.image_url
      ),
    display_order:
      normalizeDisplayOrder(
        input.display_order
      ),
    active:
      input.active ?? true,
    featured:
      input.featured ?? false,
  };

  const { data, error } =
    await supabase
      .from("categories")
      .insert(payload)
      .select("*")
      .single();

  if (error) {
    console.error(
      "Error creando la categoría maestra:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible crear la categoría."
    );
  }

  return data as CatalogCategory;
}

export async function updateCatalogCategory(
  input: UpdateCatalogCategoryData
): Promise<CatalogCategory> {
  const id = Number(input.id);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "El identificador de la categoría no es válido."
    );
  }

  const name =
    normalizeRequiredText(
      input.name,
      "nombre"
    );

  const slug = createSlug(
    input.slug || name
  );

  await ensureUniqueCategorySlug(
    slug,
    id
  );

  const payload = {
    parent_id:
      input.parent_id ?? null,
    name,
    slug,
    description:
      normalizeOptionalText(
        input.description
      ),
    icon:
      normalizeOptionalText(
        input.icon
      ),
    image_url:
      normalizeOptionalText(
        input.image_url
      ),
    display_order:
      normalizeDisplayOrder(
        input.display_order
      ),
    active:
      input.active ?? true,
    featured:
      input.featured ?? false,
  };

  const { data, error } =
    await supabase
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

  if (error) {
    console.error(
      "Error actualizando la categoría maestra:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible actualizar la categoría."
    );
  }

  return data as CatalogCategory;
}

export async function deleteCatalogCategory(
  id: number
): Promise<boolean> {
  const categoryId = Number(id);

  if (
    !Number.isInteger(categoryId) ||
    categoryId <= 0
  ) {
    throw new Error(
      "El identificador de la categoría no es válido."
    );
  }

  const {
    count,
    error: relationError,
  } = await supabase
    .from("product_categories")
    .select(
      "product_id",
      {
        count: "exact",
        head: true,
      }
    )
    .eq(
      "category_id",
      categoryId
    );

  if (relationError) {
    console.error(
      "Error comprobando productos relacionados:",
      relationError
    );

    throw new Error(
      "No fue posible comprobar si la categoría está en uso."
    );
  }

  if ((count ?? 0) > 0) {
    throw new Error(
      "La categoría no puede eliminarse porque tiene productos relacionados. Desactívala en su lugar."
    );
  }

  const { error } =
    await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

  if (error) {
    console.error(
      "Error eliminando la categoría maestra:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible eliminar la categoría."
    );
  }

  return true;
}

async function getCount(
  table: string,
  filters: Array<{
    column: string;
    value: string | number | boolean;
  }> = []
): Promise<number> {
  let query = supabase
    .from(table)
    .select(
      "*",
      {
        count: "exact",
        head: true,
      }
    );

  for (const filter of filters) {
    query = query.eq(
      filter.column,
      filter.value
    );
  }

  const { count, error } =
    await query;

  if (error) {
    console.error(
      `Error consultando el total de ${table}:`,
      error
    );

    throw new Error(
      `No fue posible consultar el total de ${table}.`
    );
  }

  return count ?? 0;
}

export async function getCatalogFoundationSummary(): Promise<CatalogFoundationSummary> {
  const [
    categories,
    activeCategories,
    suppliers,
    activeSuppliers,
    productImages,
    currentPrices,
    inventoryRecords,
    aiRecords,
    aiReadyProducts,
  ] = await Promise.all([
    getCount("categories"),
    getCount(
      "categories",
      [
        {
          column: "active",
          value: true,
        },
      ]
    ),
    getCount("suppliers"),
    getCount(
      "suppliers",
      [
        {
          column: "active",
          value: true,
        },
      ]
    ),
    getCount("product_images"),
    getCount(
      "product_prices",
      [
        {
          column: "is_current",
          value: true,
        },
      ]
    ),
    getCount(
      "product_inventory"
    ),
    getCount("product_ai"),
    getCount(
      "product_ai",
      [
        {
          column: "ai_ready",
          value: true,
        },
        {
          column: "reviewed",
          value: true,
        },
      ]
    ),
  ]);

  return {
    categories,
    activeCategories,
    suppliers,
    activeSuppliers,
    productImages,
    currentPrices,
    inventoryRecords,
    aiRecords,
    aiReadyProducts,
  };
}