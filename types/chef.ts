export type ChefDifficulty =
  | "Muy fácil"
  | "Fácil"
  | "Intermedia"
  | "Avanzada";

export type ChefDietaryTag =
  | "vegetariano"
  | "vegano"
  | "sin-gluten"
  | "sin-lacteos"
  | "alto-en-proteina"
  | "bajo-en-calorias"
  | string;

export type ChefIntent =
  | "recipe"
  | "budget"
  | "available-ingredients"
  | "quick-meal"
  | "family-meal"
  | "dietary"
  | "recommendation"
  | "unknown";

export interface ChefInstruction {
  step: number;
  title: string;
  description: string;
}

export interface ChefNutritionalInformation {
  calories?: number;
  protein_grams?: number;
  carbohydrates_grams?: number;
  fat_grams?: number;
  fiber_grams?: number;
  sodium_milligrams?: number;
  notice?: string;
}

export interface ChefRecipe {
  id: number;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category: string;
  difficulty: ChefDifficulty;
  preparation_time_minutes: number;
  cooking_time_minutes: number;
  default_portions: number;
  minimum_portions: number;
  maximum_portions: number;
  image: string | null;
  instructions: ChefInstruction[];
  nutritional_information: ChefNutritionalInformation;
  tags: string[];
  dietary_tags: ChefDietaryTag[];
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChefCatalogProduct {
  id: number;
  slug: string;
  name: string;
  category: string;
  image: string;
  price: number;
  old_price: number | null;
  unit: string;
  approx: string | null;
  stock: boolean;
  description: string | null;
  delivery: string | null;
}

export interface ChefRecipeIngredient {
  id: number;
  recipe_id: number;
  product_id: number | null;
  ingredient_name: string;
  search_terms: string[];
  quantity: number;
  measurement_unit: string;
  optional: boolean;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ChefResolvedIngredient
  extends ChefRecipeIngredient {
  scaled_quantity: number;
  product: ChefCatalogProduct | null;
  available: boolean;
  estimated_price: number;
  catalog_quantity: number;
  resolution_status:
    | "linked"
    | "matched"
    | "unavailable"
    | "missing";
}

export interface ChefRecipeWithIngredients
  extends ChefRecipe {
  ingredients: ChefResolvedIngredient[];
  requested_portions: number;
  estimated_cost: number;
  estimated_cost_per_portion: number;
  available_ingredients_count: number;
  unavailable_ingredients_count: number;
}

export interface ChefAssistantRequest {
  query: string;
  portions?: number;
  maximum_budget?: number | null;
  available_ingredients?: string[];
  excluded_ingredients?: string[];
  dietary_preferences?: ChefDietaryTag[];
}

export interface ChefAssistantInterpretation {
  original_query: string;
  normalized_query: string;
  intent: ChefIntent;
  requested_recipe: string | null;
  requested_portions: number;
  maximum_budget: number | null;
  available_ingredients: string[];
  excluded_ingredients: string[];
  dietary_preferences: ChefDietaryTag[];
  keywords: string[];
}

export interface ChefRecipeRecommendation {
  recipe: ChefRecipeWithIngredients;
  relevance_score: number;
  reasons: string[];
  fits_budget: boolean;
  fits_dietary_preferences: boolean;
}

export interface ChefAssistantResponse {
  success: boolean;
  message: string;
  interpretation: ChefAssistantInterpretation;
  recommendations: ChefRecipeRecommendation[];
  primary_recommendation: ChefRecipeRecommendation | null;
  generated_at: string;
}

export interface ChefCartIngredient {
  id: number;
  name: string;
  image: string;
  price: number;
  unit: string;
  quantity: number;
  ingredient_name: string;
  required_quantity: number;
  measurement_unit: string;
}

export interface ChefAssistantState {
  query: string;
  portions: number;
  maximum_budget: string;
  dietary_preferences: ChefDietaryTag[];
  loading: boolean;
  error: string;
  response: ChefAssistantResponse | null;
}

export interface ChefRecipeRow {
  id: number;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category: string;
  difficulty: ChefDifficulty;
  preparation_time_minutes: number;
  cooking_time_minutes: number;
  default_portions: number;
  minimum_portions: number;
  maximum_portions: number;
  image: string | null;
  instructions: unknown;
  nutritional_information: unknown;
  tags: string[] | null;
  dietary_tags: string[] | null;
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChefRecipeIngredientRow {
  id: number;
  recipe_id: number;
  product_id: number | null;
  ingredient_name: string;
  search_terms: string[] | null;
  quantity: number;
  measurement_unit: string;
  optional: boolean;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ChefRecipeIngredientRelationRow
  extends ChefRecipeIngredientRow {
  product:
    | {
        id: number;
        slug: string;
        name: string;
        category: string;
        image: string;
        price: number;
        old_price: number | null;
        unit: string;
        approx: string | null;
        stock: boolean;
        description: string | null;
        delivery: string | null;
      }
    | {
        id: number;
        slug: string;
        name: string;
        category: string;
        image: string;
        price: number;
        old_price: number | null;
        unit: string;
        approx: string | null;
        stock: boolean;
        description: string | null;
        delivery: string | null;
      }[]
    | null;
}