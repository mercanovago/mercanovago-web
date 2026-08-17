export interface ProductAdminData {
  name: string;
  category: string;
  price: number;
  old_price: number | null;
  unit: string;
  approx: string | null;
  image: string;
  description: string | null;
  origin: string | null;
  delivery: string | null;
  badge: string | null;
  stock: boolean;
  featured: boolean;
}

export interface CreateProductData extends ProductAdminData {}

export interface UpdateProductData extends ProductAdminData {
  id: number;
}

export interface AdminProductRecord {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  old_price: number | null;
  unit: string;
  approx: string | null;
  image: string;
  description: string | null;
  origin: string | null;
  delivery: string | null;
  badge: string | null;
  stock: boolean;
  featured: boolean;
  created_at?: string;
}

export interface BulkImportProductData extends ProductAdminData {
  slug: string;
}

export type BulkImportRowStatus =
  | "valid"
  | "warning"
  | "error";

export interface BulkImportValidationMessage {
  field: keyof BulkImportProductData | "general";
  message: string;
}

export interface BulkImportPreviewRow {
  rowNumber: number;
  selected: boolean;
  status: BulkImportRowStatus;
  data: BulkImportProductData;
  errors: BulkImportValidationMessage[];
  warnings: BulkImportValidationMessage[];
}

export interface BulkImportParseResult {
  fileName: string;
  totalRows: number;
  validRows: number;
  warningRows: number;
  errorRows: number;
  rows: BulkImportPreviewRow[];
}

export interface BulkImportResult {
  imported: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: string[];
}