import { supabase } from "@/lib/supabase";

import type { Product } from "@/types/product";

interface ProductImageRecord {
  product_id: number;
  image_url: string | null;
  is_primary: boolean | null;
  display_order: number | null;
  active: boolean | null;
}

function resolveProductImage(
  productId: number,
  fallbackImage: unknown,
  imagesByProduct: Map<number, ProductImageRecord[]>
): string {
  const images =
    imagesByProduct.get(productId) ?? [];

  const activeImages = images
    .filter(
      (image) =>
        image.active !== false &&
        Boolean(image.image_url)
    )
    .sort((a, b) => {
      const primaryDifference =
        Number(Boolean(b.is_primary)) -
        Number(Boolean(a.is_primary));

      if (primaryDifference !== 0) {
        return primaryDifference;
      }

      return (
        Number(a.display_order ?? 0) -
        Number(b.display_order ?? 0)
      );
    });

  const catalogImage =
    activeImages[0]?.image_url;

  if (catalogImage) {
    return String(catalogImage);
  }

  if (fallbackImage) {
    return String(fallbackImage);
  }

  return "";
}

export async function getProducts(): Promise<Product[]> {
  const {
    data: productsData,
    error: productsError,
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
        image,
        unit,
        approx,
        stock,
        featured,
        badge,
        delivery,
        description,
        origin,
        created_at
      `
    )
    .order("id", {
      ascending: true,
    });

  if (productsError) {
    console.error(
      "Error obteniendo productos:",
      productsError
    );

    return [];
  }

  const products = productsData ?? [];

  if (products.length === 0) {
    return [];
  }

  const productIds = products.map(
    (product) => Number(product.id)
  );

  const {
    data: imagesData,
    error: imagesError,
  } = await supabase
    .from("product_images")
    .select(
      `
        product_id,
        image_url,
        is_primary,
        display_order,
        active
      `
    )
    .in("product_id", productIds)
    .eq("active", true)
    .order("is_primary", {
      ascending: false,
    })
    .order("display_order", {
      ascending: true,
    });

  if (imagesError) {
    console.error(
      "Error obteniendo fotografías del catálogo:",
      imagesError
    );
  }

  const imagesByProduct =
    new Map<number, ProductImageRecord[]>();

  for (
    const image of
      (imagesData ?? []) as ProductImageRecord[]
  ) {
    const productId =
      Number(image.product_id);

    const currentImages =
      imagesByProduct.get(productId) ?? [];

    currentImages.push(image);

    imagesByProduct.set(
      productId,
      currentImages
    );
  }

  return products.map((product) => {
    const productId =
      Number(product.id);

    return {
      id: productId,
      slug: String(product.slug),
      name: String(product.name),
      category: String(product.category),
      price: Number(product.price),
      old_price:
        product.old_price === null
          ? null
          : Number(product.old_price),
      image: resolveProductImage(
        productId,
        product.image,
        imagesByProduct
      ),
      unit: String(product.unit),
      approx:
        product.approx
          ? String(product.approx)
          : null,
      stock: Boolean(product.stock),
      featured: Boolean(product.featured),
      badge:
        product.badge
          ? String(product.badge)
          : null,
      delivery:
        product.delivery
          ? String(product.delivery)
          : null,
      description:
        product.description
          ? String(product.description)
          : null,
      origin:
        product.origin
          ? String(product.origin)
          : null,
      created_at: String(
        product.created_at ?? ""
      ),
    };
  });
}