import { supabase } from "@/lib/supabase";

import {
  tryCreateAuditLog,
} from "@/services/auditLog";

import type {
  AdminProductRecord,
  CreateProductData,
} from "@/types/adminProduct";

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

function validatePrice(
  value: number,
  fieldName: string
): number {
  const normalizedValue = Number(value);

  if (
    !Number.isFinite(normalizedValue) ||
    normalizedValue <= 0
  ) {
    throw new Error(
      `El campo ${fieldName} debe contener un valor mayor que cero.`
    );
  }

  return Number(
    normalizedValue.toFixed(2)
  );
}

function normalizeOldPrice(
  oldPrice: number | null,
  currentPrice: number
): number | null {
  if (
    oldPrice === null ||
    oldPrice === undefined ||
    oldPrice === 0
  ) {
    return null;
  }

  const normalizedOldPrice =
    Number(oldPrice);

  if (
    !Number.isFinite(normalizedOldPrice) ||
    normalizedOldPrice <= currentPrice
  ) {
    return null;
  }

  return Number(
    normalizedOldPrice.toFixed(2)
  );
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function createUniqueSlug(
  productName: string
): Promise<string> {
  const baseSlug = createSlug(productName);

  if (!baseSlug) {
    throw new Error(
      "No fue posible generar un identificador para el producto."
    );
  }

  const { data, error } = await supabase
    .from("products")
    .select("slug")
    .ilike("slug", `${baseSlug}%`);

  if (error) {
    console.error(
      "Error comprobando el slug del producto:",
      error
    );

    throw new Error(
      "No fue posible comprobar el identificador del producto."
    );
  }

  const existingSlugs = new Set(
    (data ?? []).map((item) =>
      String(item.slug)
    )
  );

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;

  while (
    existingSlugs.has(
      `${baseSlug}-${suffix}`
    )
  ) {
    suffix += 1;
  }

  return `${baseSlug}-${suffix}`;
}

async function validateDuplicatedProduct(
  productName: string
): Promise<void> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name")
    .ilike("name", productName)
    .limit(1);

  if (error) {
    console.error(
      "Error comprobando productos duplicados:",
      error
    );

    throw new Error(
      "No fue posible comprobar si el producto ya existe."
    );
  }

  if ((data ?? []).length > 0) {
    throw new Error(
      `Ya existe un producto registrado con el nombre "${productName}".`
    );
  }
}

export async function createProduct(
  data: CreateProductData
): Promise<AdminProductRecord> {
  const startedAt = Date.now();

  const name = normalizeRequiredText(
    data.name,
    "nombre"
  );

  const category = normalizeRequiredText(
    data.category,
    "categoría"
  );

  const unit = normalizeRequiredText(
    data.unit,
    "unidad"
  );

  const price = validatePrice(
    data.price,
    "precio"
  );

  const oldPrice = normalizeOldPrice(
    data.old_price,
    price
  );

  await validateDuplicatedProduct(name);

  const slug = await createUniqueSlug(
    name
  );

  const productPayload = {
    slug,
    name,
    category,
    price,
    old_price: oldPrice,
    image: data.image.trim(),
    unit,
    approx: normalizeOptionalText(
      data.approx
    ),
    stock: Boolean(data.stock),
    featured: Boolean(data.featured),
    badge:
      normalizeOptionalText(data.badge) ??
      (data.featured
        ? "Destacado"
        : "Disponible"),
    delivery:
      normalizeOptionalText(
        data.delivery
      ) ?? "Entrega coordinada",
    description: normalizeOptionalText(
      data.description
    ),
    origin:
      normalizeOptionalText(
        data.origin
      ) ?? "Proveedores seleccionados",
  };

  const {
    data: product,
    error,
  } = await supabase
    .from("products")
    .insert(productPayload)
    .select("*")
    .single();

  if (error) {
    console.error(
      "Error creando producto:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible crear el producto."
    );
  }

  const createdProduct =
    product as AdminProductRecord;

  await tryCreateAuditLog({
    module: "products",
    entity: "product",
    entityId: createdProduct.id,
    action: "create",
    status: "success",
    summary: `Se creó el producto "${createdProduct.name}".`,
    newValues: {
      id: String(createdProduct.id),
      slug: createdProduct.slug,
      name: createdProduct.name,
      category: createdProduct.category,
      price: Number(createdProduct.price),
      old_price:
        createdProduct.old_price === null
          ? null
          : Number(createdProduct.old_price),
      image: createdProduct.image,
      unit: createdProduct.unit,
      approx: createdProduct.approx,
      stock: Boolean(createdProduct.stock),
      featured: Boolean(
        createdProduct.featured
      ),
      badge: createdProduct.badge,
      delivery:
        createdProduct.delivery,
      description:
        createdProduct.description,
      origin: createdProduct.origin,
    },
    metadata: {
      source: "admin_product_form",
      operation:
        "individual_product_creation",
    },
    durationMs:
      Date.now() - startedAt,
  });

  return createdProduct;
}