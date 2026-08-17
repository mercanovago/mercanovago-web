export type ProductIntelligenceStatus =
  | "draft"
  | "review"
  | "approved"
  | "published"
  | "archived";

export interface ProductIntelligenceRecord {
  id: number;
  product_id: number;

  commercial_description: string | null;
  long_description: string | null;
  benefits: string[];
  characteristics: string[];

  nutrition_json: Record<string, unknown>;

  storage_instructions: string | null;
  storage_temperature: string | null;
  shelf_life: string | null;
  washing_instructions: string | null;
  consumption_instructions: string | null;

  chef_notes: string | null;
  recipe_tips: string[];
  suggested_uses: string[];

  synonyms: string[];
  search_keywords: string[];
  related_product_ids: number[];
  substitute_product_ids: number[];
  complementary_product_ids: number[];
  seasonality: string | null;
  commercial_priority: number;

  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];

  content_status: ProductIntelligenceStatus;
  reviewed_at: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProductIntelligencePayload {
  product_id: number;

  commercial_description: string;
  long_description: string;
  benefits: string[];
  characteristics: string[];

  nutrition_json: Record<string, unknown>;

  storage_instructions: string;
  storage_temperature: string;
  shelf_life: string;
  washing_instructions: string;
  consumption_instructions: string;

  chef_notes: string;
  recipe_tips: string[];
  suggested_uses: string[];

  synonyms: string[];
  search_keywords: string[];
  related_product_ids: number[];
  substitute_product_ids: number[];
  complementary_product_ids: number[];
  seasonality: string;
  commercial_priority: number;

  seo_title: string;
  seo_description: string;
  seo_keywords: string[];

  content_status: ProductIntelligenceStatus;
}