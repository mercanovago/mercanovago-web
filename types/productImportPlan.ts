import type {
  AdminProductRecord,
  BulkImportParseResult,
  BulkImportPreviewRow,
} from "@/types/adminProduct";

import type {
  ProductDuplicateAnalysis,
  ProductImportAction,
} from "@/types/duplicateDetection";

export type ProductImportDecisionStatus =
  | "ready"
  | "review"
  | "blocked"
  | "skipped";

export interface PlannedProductImportRow
  extends BulkImportPreviewRow {
  duplicateAnalysis: ProductDuplicateAnalysis;
  action: ProductImportAction;
  decisionStatus: ProductImportDecisionStatus;
  matchedProduct: AdminProductRecord | null;
}

export interface ProductImportPlan {
  fileName: string;
  totalRows: number;

  newRows: number;
  exactMatchRows: number;
  strongMatchRows: number;
  possibleMatchRows: number;

  createRows: number;
  updateRows: number;
  skippedRows: number;
  blockedRows: number;

  rows: PlannedProductImportRow[];
}

export interface CreateProductImportPlanParams {
  parseResult: BulkImportParseResult;
  currentProducts: AdminProductRecord[];
}