import { supabase } from "@/lib/supabase";

import {
  tryCreateAuditLog,
} from "@/services/auditLog";

import type {
  AdminProductRecord,
  UpdateProductData,
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

async function validateDuplicatedProduct(
  id: number,
  productName: string
): Promise<void> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name")
    .ilike("name", productName)
    .neq("id", id)
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
      `Ya existe otro producto registrado con el nombre "${productName}".`
    );
  }
}

function buildProductSnapshot(
  product: AdminProductRecord
) {
  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: Number(product.price),
    old_price:
      product.old_price === null
        ? null
        : Number(product.old_price),
    unit: product.unit,
    approx: product.approx,
    image: product.image,
    description:
      product.description,
    origin: product.origin,
    delivery: product.delivery,
    badge: product.badge,
    stock: Boolean(product.stock),
    featured: Boolean(
      product.featured
    ),
  };
}

function getChangedFields(
  previousProduct: AdminProductRecord,
  updatedProduct: AdminProductRecord
): string[] {
  const previous =
    buildProductSnapshot(
      previousProduct
    );

  const updated =
    buildProductSnapshot(
      updatedProduct
    );

  return Object.keys(updated).filter(
    (key) =>
      JSON.stringify(
        previous[
          key as keyof typeof previous
        ]
      ) !==
      JSON.stringify(
        updated[
          key as keyof typeof updated
        ]
      )
  );
}

export async function updateProduct(
  data: UpdateProductData
): Promise<AdminProductRecord> {
  const startedAt = Date.now();

  const id = Number(data.id);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "El identificador del producto no es válido."
    );
  }

  const {
    data: currentProductData,
    error: currentProductError,
  } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (currentProductError) {
    console.error(
      "Error consultando el producto antes de actualizar:",
      currentProductError
    );

    throw new Error(
      currentProductError.message ||
        "No fue posible consultar el producto antes de actualizarlo."
    );
  }

  if (!currentProductData) {
    throw new Error(
      "El producto que deseas actualizar no existe."
    );
  }

  const currentProduct =
    currentProductData as AdminProductRecord;

  const name = normalizeRequiredText(
    data.name,
    "nombre"
  );

  const category =
    normalizeRequiredText(
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

  await validateDuplicatedProduct(
    id,
    name
  );

  const productPayload = {
    name,
    category,
    price,
    old_price: oldPrice,
    unit,
    approx: normalizeOptionalText(
      data.approx
    ),
    image: data.image.trim(),
    description: normalizeOptionalText(
      data.description
    ),
    origin:
      normalizeOptionalText(
        data.origin
      ) ?? "Proveedores seleccionados",
    delivery:
      normalizeOptionalText(
        data.delivery
      ) ?? "Entrega coordinada",
    badge:
      normalizeOptionalText(
        data.badge
      ) ??
      (data.featured
        ? "Destacado"
        : "Disponible"),
    stock: Boolean(data.stock),
    featured: Boolean(
      data.featured
    ),
  };

  const {
    data: product,
    error,
  } = await supabase
    .from("products")
    .update(productPayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error(
      "Error actualizando producto:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible actualizar el producto."
    );
  }

  const updatedProduct =
    product as AdminProductRecord;

  const changedFields =
    getChangedFields(
      currentProduct,
      updatedProduct
    );

  const priceChanged =
    Number(currentProduct.price) !==
    Number(updatedProduct.price);

  const stockChanged =
    Boolean(currentProduct.stock) !==
    Boolean(updatedProduct.stock);

  const featuredChanged =
    Boolean(
      currentProduct.featured
    ) !==
    Boolean(
      updatedProduct.featured
    );

  await tryCreateAuditLog({
    module: priceChanged
      ? "prices"
      : "products",
    entity: priceChanged
      ? "product_price"
      : "product",
    entityId: id,
    action: priceChanged
      ? "price_update"
      : "update",
    status: "success",
    summary: priceChanged
      ? `Se actualizó el producto "${updatedProduct.name}" y su precio cambió de $${Number(
          currentProduct.price
        ).toFixed(2)} a $${Number(
          updatedProduct.price
        ).toFixed(2)}.`
      : `Se actualizó el producto "${updatedProduct.name}".`,
    oldValues:
      buildProductSnapshot(
        currentProduct
      ),
    newValues:
      buildProductSnapshot(
        updatedProduct
      ),
    metadata: {
      source: "admin_product_form",
      operation:
        "individual_product_update",
      changedFields,
      priceChanged,
      stockChanged,
      featuredChanged,
    },
    durationMs:
      Date.now() - startedAt,
  });

  return updatedProduct;
}