export interface ProductImage {
  id: number;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
}

export interface ProductIntelligence {
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
  seasonality: string[];

  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  old_price: number | null;
  image: string;
  images?: ProductImage[];
  unit: string;
  approx: string | null;
  stock: boolean;
  featured: boolean;
  badge: string | null;
  delivery: string | null;
  description: string | null;
  origin: string | null;
  created_at: string;

  intelligence?: ProductIntelligence | null;
}