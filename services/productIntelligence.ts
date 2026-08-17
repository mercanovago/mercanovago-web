import { supabase } from "@/lib/supabase";

import type {
  ProductIntelligencePayload,
  ProductIntelligenceRecord,
} from "@/types/productIntelligence";

function normalizeStringArray(
  value: unknown
): string[] {
  if (Array.isArray(value)) {
    return value
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
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

function normalizeRecord(
  value: Record<string, unknown>
): ProductIntelligenceRecord {
  const productId = Number(value.product_id);

  return {
    /*
     * public.product_ai utiliza product_id como identificador
     * operativo. Mantenemos id como alias lógico para no romper
     * la interfaz del ERP.
     */
    id: Number(value.id ?? productId),
    product_id: productId,

    commercial_description:
      value.commercial_description
        ? String(value.commercial_description)
        : null,

    long_description:
      value.long_description
        ? String(value.long_description)
        : null,

    benefits: Array.isArray(value.benefits)
      ? value.benefits.map(String)
      : [],

    characteristics: Array.isArray(
      value.characteristics
    )
      ? value.characteristics.map(String)
      : [],

    nutrition_json:
      value.nutrition_json &&
      typeof value.nutrition_json === "object" &&
      !Array.isArray(value.nutrition_json)
        ? (value.nutrition_json as Record<
            string,
            unknown
          >)
        : {},

    storage_instructions:
      value.storage_instructions
        ? String(value.storage_instructions)
        : null,

    storage_temperature:
      value.storage_temperature
        ? String(value.storage_temperature)
        : null,

    shelf_life:
      value.shelf_life
        ? String(value.shelf_life)
        : null,

    washing_instructions:
      value.washing_instructions
        ? String(value.washing_instructions)
        : null,

    consumption_instructions:
      value.consumption_instructions
        ? String(value.consumption_instructions)
        : null,

    chef_notes:
      value.chef_notes
        ? String(value.chef_notes)
        : null,

    recipe_tips: Array.isArray(
      value.recipe_tips
    )
      ? value.recipe_tips.map(String)
      : [],

    suggested_uses: Array.isArray(
      value.suggested_uses
    )
      ? value.suggested_uses.map(String)
      : [],

    synonyms: normalizeStringArray(
      value.synonyms
    ),

    search_keywords: normalizeStringArray(
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

    /*
     * En PostgreSQL, seasonality es text[].
     * La UI actual trabaja con una cadena para facilitar edición.
     * Convertimos el array real de la BD a una cadena separada
     * por comas al leer.
     */
    seasonality: normalizeStringArray(
      value.seasonality
    ).join(", ") || null,

    commercial_priority: Number(
      value.commercial_priority ?? 0
    ),

    seo_title:
      value.seo_title
        ? String(value.seo_title)
        : null,

    seo_description:
      value.seo_description
        ? String(value.seo_description)
        : null,

    seo_keywords: normalizeStringArray(
      value.seo_keywords
    ),

    content_status:
      (value.content_status as ProductIntelligenceRecord["content_status"]) ??
      "draft",

    reviewed_at:
      value.reviewed_at
        ? String(value.reviewed_at)
        : null,

    published_at:
      value.published_at
        ? String(value.published_at)
        : null,

    created_at:
      value.created_at
        ? String(value.created_at)
        : null,

    updated_at:
      value.updated_at
        ? String(value.updated_at)
        : null,
  };
}

function prepareDatabasePayload(
  payload: ProductIntelligencePayload
) {
  return {
    ...payload,

    /*
     * IMPORTANTE:
     * public.product_ai.seasonality es text[].
     * Nunca debemos enviar "" porque PostgreSQL intenta
     * interpretarlo como literal de array y devuelve:
     * malformed array literal: ""
     */
    seasonality: normalizeStringArray(
      payload.seasonality
    ),
  };
}

export async function getProductIntelligenceRecords(): Promise<
  ProductIntelligenceRecord[]
> {
  const { data, error } = await supabase
    .from("product_ai")
    .select("*")
    .order("product_id", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error consultando inteligencia de productos:",
      error
    );

    throw new Error(
      `No fue posible cargar la inteligencia de los productos. ${
        error.message ?? ""
      }`.trim()
    );
  }

  return (data ?? []).map((item) =>
    normalizeRecord(
      item as Record<string, unknown>
    )
  );
}

export async function saveProductIntelligence(
  payload: ProductIntelligencePayload
): Promise<ProductIntelligenceRecord> {
  const {
    data: existingRows,
    error: findError,
  } = await supabase
    .from("product_ai")
    .select("product_id")
    .eq(
      "product_id",
      payload.product_id
    )
    .limit(1);

  if (findError) {
    console.error(
      "Error verificando inteligencia del producto:",
      findError
    );

    throw new Error(
      `No fue posible verificar el registro del producto. ${
        findError.message ?? ""
      }`.trim()
    );
  }

  const exists =
    Array.isArray(existingRows) &&
    existingRows.length > 0;

  const now = new Date().toISOString();

  const timestamps = {
    reviewed_at:
      payload.content_status === "review" ||
      payload.content_status === "approved" ||
      payload.content_status === "published"
        ? now
        : null,

    published_at:
      payload.content_status === "published"
        ? now
        : null,
  };

  const databasePayload = {
    ...prepareDatabasePayload(payload),
    ...timestamps,
  };

  if (exists) {
    const {
      data,
      error,
    } = await supabase
      .from("product_ai")
      .update(databasePayload)
      .eq(
        "product_id",
        payload.product_id
      )
      .select("*")
      .single();

    if (error) {
      console.error(
        "Error actualizando inteligencia del producto:",
        error
      );

      throw new Error(
        `No fue posible actualizar la inteligencia del producto. ${
          error.message ?? ""
        }`.trim()
      );
    }

    return normalizeRecord(
      data as Record<string, unknown>
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("product_ai")
    .insert(databasePayload)
    .select("*")
    .single();

  if (error) {
    console.error(
      "Error creando inteligencia del producto:",
      error
    );

    throw new Error(
      `No fue posible crear la inteligencia del producto. ${
        error.message ?? ""
      }`.trim()
    );
  }

  return normalizeRecord(
    data as Record<string, unknown>
  );
}