import type {
  AdminProductRecord,
  BulkImportProductData,
} from "@/types/adminProduct";

export type ProductDuplicateMatchType =
  | "new"
  | "exact"
  | "strong"
  | "possible";

export type ProductImportAction =
  | "create"
  | "update"
  | "skip";

export type ProductComparisonField =
  | "slug"
  | "name"
  | "category"
  | "unit";

export interface ProductDuplicateReason {
  field: ProductComparisonField;
  label: string;
  matched: boolean;
  weight: number;
  detail: string;
}

export interface ProductDuplicateCandidate {
  product: AdminProductRecord;
  score: number;
  matchType: ProductDuplicateMatchType;
  reasons: ProductDuplicateReason[];
}

export interface ProductDuplicateAnalysis {
  importedProduct: BulkImportProductData;
  matchType: ProductDuplicateMatchType;
  confidence: number;
  recommendedAction: ProductImportAction;
  matchedProduct: AdminProductRecord | null;
  candidates: ProductDuplicateCandidate[];
  summary: string;
}

export interface ProductFieldDifference {
  field: keyof BulkImportProductData;
  label: string;
  currentValue: string | number | boolean | null;
  importedValue: string | number | boolean | null;
  changed: boolean;
}