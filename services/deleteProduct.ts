import { supabase } from "@/lib/supabase";

import {
  tryCreateAuditLog,
} from "@/services/auditLog";

import type {
  AdminProductRecord,
} from "@/types/adminProduct";

export async function deleteProduct(
  id: number
): Promise<boolean> {
  const startedAt = Date.now();

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
    data: existingProduct,
    error: readError,
  } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();

  if (readError) {
    console.error(
      "Error consultando el producto antes de eliminar:",
      readError
    );

    throw new Error(
      readError.message ||
        "No fue posible consultar el producto antes de eliminarlo."
    );
  }

  if (!existingProduct) {
    throw new Error(
      "El producto que deseas eliminar no existe."
    );
  }

  const product =
    existingProduct as AdminProductRecord;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error(
      "Error eliminando producto:",
      error
    );

    throw new Error(
      error.message ||
        "No fue posible eliminar el producto."
    );
  }

  await tryCreateAuditLog({
    module: "products",
    entity: "product",
    entityId: productId,
    action: "delete",
    status: "success",
    summary: `Se eliminó el producto "${product.name}".`,
    oldValues: {
      id: String(product.id),
      slug: product.slug,
      name: product.name,
      category: product.category,
      price: Number(product.price),
      old_price:
        product.old_price === null
          ? null
          : Number(product.old_price),
      image: product.image,
      unit: product.unit,
      approx: product.approx,
      stock: Boolean(product.stock),
      featured: Boolean(
        product.featured
      ),
      badge: product.badge,
      delivery: product.delivery,
      description:
        product.description,
      origin: product.origin,
    },
    metadata: {
      source: "admin_products",
      operation:
        "individual_product_deletion",
    },
    durationMs:
      Date.now() - startedAt,
  });

  return true;
}