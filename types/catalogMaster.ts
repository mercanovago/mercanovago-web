export interface CatalogCategory {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  display_order: number;
  active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCatalogCategoryData {
  parent_id?: number | null;
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  image_url?: string | null;
  display_order?: number;
  active?: boolean;
  featured?: boolean;
}

export interface UpdateCatalogCategoryData
  extends CreateCatalogCategoryData {
  id: number;
}

export interface Supplier {
  id: number;
  name: string;
  legal_name: string | null;
  tax_id: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  contact_name: string | null;
  notes: string | null;
  active: boolean;
  preferred: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  storage_path: string | null;
  image_type:
    | "primary"
    | "gallery"
    | "side"
    | "nutrition"
    | "preparation"
    | "presentation"
    | "market_source";
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  active: boolean;
  width: number | null;
  height: number | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductPriceRecord {
  id: number;
  product_id: number;
  supplier_id: number | null;
  source:
    | "manual"
    | "supplier"
    | "market_image"
    | "bulk_import"
    | "automatic"
    | "promotion";
  source_reference: string | null;
  wholesale_price: number | null;
  purchase_price: number | null;
  margin_percent: number;
  suggested_price: number | null;
  published_price: number;
  old_published_price: number | null;
  valid_from: string;
  valid_to: string | null;
  is_current: boolean;
  created_by: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface ProductInventoryRecord {
  product_id: number;
  quantity_on_hand: number;
  quantity_reserved: number;
  minimum_stock: number;
  maximum_stock: number | null;
  reorder_point: number | null;
  unit: string | null;
  warehouse_location: string | null;
  track_inventory: boolean;
  allow_backorder: boolean;
  last_movement_at: string | null;
  last_counted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductAIRecord {
  product_id: number;
  ingredients: string[];
  allergens: string[];
  dietary_tags: string[];
  keywords: string[];
  recipe_tags: string[];
  substitution_keywords: string[];
  seasonality: string[];
  calories_per_100g: number | null;
  protein_g_per_100g: number | null;
  carbohydrates_g_per_100g: number | null;
  fat_g_per_100g: number | null;
  fiber_g_per_100g: number | null;
  sodium_mg_per_100g: number | null;
  preparation_notes: string | null;
  storage_notes: string | null;
  popularity_score: number;
  ai_ready: boolean;
  reviewed: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CatalogFoundationSummary {
  categories: number;
  activeCategories: number;
  suppliers: number;
  activeSuppliers: number;
  productImages: number;
  currentPrices: number;
  inventoryRecords: number;
  aiRecords: number;
  aiReadyProducts: number;
}