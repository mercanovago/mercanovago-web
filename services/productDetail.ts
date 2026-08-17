import { supabase } from "@/lib/supabase";

import type {
  Product,
  ProductImage,
  ProductIntelligence,
} from "@/types/product";

interface ProductImageRecord {
  id: number | string;
  image_url: string | null;
  alt_text: string | null;
  is_primary: boolean | null;
  display_order: number | null;
  active: boolean | null;
}

interface ProductIntelligenceRecord {
  commercial_description: string | null;
  long_description: string | null;
  benefits: unknown;
  characteristics: unknown;

  nutrition_json: unknown;

  storage_instructions: string | null;
  storage_temperature: string | null;
  shelf_life: string | null;
  washing_instructions: string | null;
  consumption_instructions: string | null;

  chef_notes: string | null;
  recipe_tips: unknown;
  suggested_uses: unknown;

  synonyms: unknown;
  search_keywords: unknown;
  related_product_ids: unknown;
  substitute_product_ids: unknown;
  complementary_product_ids: unknown;
  seasonality: unknown;

  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: unknown;

  content_status: string | null;
}

function normalizeSlug(slug: string): string {
  return decodeURIComponent(slug)
    .trim()
    .toLowerCase();
}

function normalizeStringArray(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(String)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeNumberArray(
  value: unknown
): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(Number)
    .filter(Number.isFinite);
}

function normalizeProductImages(
  images: ProductImageRecord[],
  legacyImage: unknown
): ProductImage[] {
  const normalizedImages = images
    .filter(
      (image) =>
        image.active !== false &&
        Boolean(image.image_url?.trim())
    )
    .map((image) => ({
      id: Number(image.id),
      image_url: String(image.image_url).trim(),
      alt_text: image.alt_text
        ? String(image.alt_text)
        : null,
      is_primary: Boolean(image.is_primary),
      display_order: Number(image.display_order ?? 0),
    }))
    .sort((a, b) => {
      const primaryDifference =
        Number(b.is_primary) -
        Number(a.is_primary);

      if (primaryDifference !== 0) {
        return primaryDifference;
      }

      return a.display_order - b.display_order;
    });

  const legacyImageUrl = legacyImage
    ? String(legacyImage).trim()
    : "";

  if (
    legacyImageUrl &&
    !normalizedImages.some(
      (image) =>
        image.image_url === legacyImageUrl
    )
  ) {
    normalizedImages.push({
      id: -1,
      image_url: legacyImageUrl,
      alt_text: null,
      is_primary:
        normalizedImages.length === 0,
      display_order:
        normalizedImages.length,
    });
  }

  return normalizedImages;
}

function normalizeProductIntelligence(
  value: ProductIntelligenceRecord | null
): ProductIntelligence | null {
  if (!value) {
    return null;
  }

  return {
    commercial_description:
      value.commercial_description
        ? String(
            value.commercial_description
          )
        : null,

    long_description:
      value.long_description
        ? String(value.long_description)
        : null,

    benefits:
      normalizeStringArray(
        value.benefits
      ),

    characteristics:
      normalizeStringArray(
        value.characteristics
      ),

    nutrition_json:
      value.nutrition_json &&
      typeof value.nutrition_json ===
        "object" &&
      !Array.isArray(
        value.nutrition_json
      )
        ? (value.nutrition_json as Record<
            string,
            unknown
          >)
        : {},

    storage_instructions:
      value.storage_instructions
        ? String(
            value.storage_instructions
          )
        : null,

    storage_temperature:
      value.storage_temperature
        ? String(
            value.storage_temperature
          )
        : null,

    shelf_life:
      value.shelf_life
        ? String(value.shelf_life)
        : null,

    washing_instructions:
      value.washing_instructions
        ? String(
            value.washing_instructions
          )
        : null,

    consumption_instructions:
      value.consumption_instructions
        ? String(
            value.consumption_instructions
          )
        : null,

    chef_notes:
      value.chef_notes
        ? String(value.chef_notes)
        : null,

    recipe_tips:
      normalizeStringArray(
        value.recipe_tips
      ),

    suggested_uses:
      normalizeStringArray(
        value.suggested_uses
      ),

    synonyms:
      normalizeStringArray(
        value.synonyms
      ),

    search_keywords:
      normalizeStringArray(
        value.search_keywords
      ),

    related_product_ids:
      normalizeNumberArray(
        value.related_product_ids
      ),

    substitute_product_ids:
      normalizeNumberArray(
        value.substitute_product_ids
      ),

    complementary_product_ids:
      normalizeNumberArray(
        value.complementary_product_ids
      ),

    seasonality:
      normalizeStringArray(
        value.seasonality
      ),

    seo_title:
      value.seo_title
        ? String(value.seo_title)
        : null,

    seo_description:
      value.seo_description
        ? String(
            value.seo_description
          )
        : null,

    seo_keywords:
      normalizeStringArray(
        value.seo_keywords
      ),
  };
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const cleanSlug =
    normalizeSlug(slug);

  if (!cleanSlug) {
    return null;
  }

  const {
    data: productData,
    error: productError,
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
    .eq("slug", cleanSlug)
    .maybeSingle();

  if (productError) {
    console.error(
      "Error consultando el detalle del producto:",
      productError
    );

    throw new Error(
      "No fue posible cargar el producto solicitado."
    );
  }

  if (!productData) {
    return null;
  }

  const productId =
    Number(productData.id);

  const [
    imageResult,
    intelligenceResult,
  ] = await Promise.all([
    supabase
      .from("product_images")
      .select(
        `
          id,
          image_url,
          alt_text,
          is_primary,
          display_order,
          active
        `
      )
      .eq(
        "product_id",
        productId
      )
      .eq(
        "active",
        true
      )
      .order(
        "is_primary",
        {
          ascending: false,
        }
      )
      .order(
        "display_order",
        {
          ascending: true,
        }
      ),

    supabase
      .from("product_ai")
      .select(
        `
          commercial_description,
          long_description,
          benefits,
          characteristics,
          nutrition_json,
          storage_instructions,
          storage_temperature,
          shelf_life,
          washing_instructions,
          consumption_instructions,
          chef_notes,
          recipe_tips,
          suggested_uses,
          synonyms,
          search_keywords,
          related_product_ids,
          substitute_product_ids,
          complementary_product_ids,
          seasonality,
          seo_title,
          seo_description,
          seo_keywords,
          content_status
        `
      )
      .eq(
        "product_id",
        productId
      )
      .eq(
        "content_status",
        "published"
      )
      .limit(1),
  ]);

  const {
    data: imageData,
    error: imageError,
  } = imageResult;

  const {
    data: intelligenceData,
    error: intelligenceError,
  } = intelligenceResult;

  if (imageError) {
    console.error(
      "Error consultando las fotografías del producto:",
      imageError
    );
  }

  if (intelligenceError) {
    console.error(
      "Error consultando la inteligencia publicada del producto:",
      intelligenceError
    );
  }

  const images =
    normalizeProductImages(
      (imageData ?? []) as ProductImageRecord[],
      productData.image
    );

  const publishedIntelligence =
    normalizeProductIntelligence(
      (
        intelligenceData?.[0] ??
        null
      ) as ProductIntelligenceRecord | null
    );

  return {
    id: productId,

    slug:
      String(productData.slug),

    name:
      String(productData.name),

    category:
      String(
        productData.category
      ),

    price:
      Number(
        productData.price
      ),

    old_price:
      productData.old_price ===
      null
        ? null
        : Number(
            productData.old_price
          ),

    image:
      images[0]?.image_url ??
      "",

    images,

    unit:
      String(
        productData.unit
      ),

    approx:
      productData.approx
        ? String(
            productData.approx
          )
        : null,

    stock:
      Boolean(
        productData.stock
      ),

    featured:
      Boolean(
        productData.featured
      ),

    badge:
      productData.badge
        ? String(
            productData.badge
          )
        : null,

    delivery:
      productData.delivery
        ? String(
            productData.delivery
          )
        : null,

    /*
     * Cuando existe inteligencia publicada, usamos la
     * descripción comercial como descripción pública principal.
     * Si no existe, conservamos el campo legacy de products.
     */
    description:
      publishedIntelligence
        ?.commercial_description ??
      (
        productData.description
          ? String(
              productData.description
            )
          : null
      ),

    origin:
      productData.origin
        ? String(
            productData.origin
          )
        : null,

    created_at:
      String(
        productData.created_at ??
        ""
      ),

    intelligence:
      publishedIntelligence,
  };
}