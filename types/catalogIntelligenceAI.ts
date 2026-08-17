export interface CatalogIntelligenceAIProduct {
  id: number;
  slug: string;
  name: string;
  category: string;
  unit: string;
  approx: string | null;
  description: string | null;
  origin: string | null;
  delivery: string | null;
}

export interface CatalogIntelligenceAICurrent {
  commercial_description: string;
  long_description: string;
  benefits: string[];
  characteristics: string[];

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
  seasonality: string;

  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
}

export interface CatalogIntelligenceAIRequest {
  product: CatalogIntelligenceAIProduct;
  current: CatalogIntelligenceAICurrent;
}

export interface CatalogIntelligenceAIProposal {
  commercial_description: string;
  long_description: string;

  benefits: string[];
  characteristics: string[];

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
  seasonality: string[];

  seo_title: string;
  seo_description: string;
  seo_keywords: string[];

  warnings: string[];
}

export interface CatalogIntelligenceAIResponse {
  proposal: CatalogIntelligenceAIProposal;
  generated_at: string;
}

export interface CatalogIntelligenceAIErrorResponse {
  error: string;
  detail?: string;
}