import type {
  AdminRole,
} from "@/services/adminLogin";

export type AuditLogModule =
  | "catalog"
  | "products"
  | "prices"
  | "photos"
  | "orders"
  | "delivery"
  | "customers"
  | "security"
  | "market_ai"
  | "system";

export type AuditLogEntity =
  | "product_import"
  | "product"
  | "product_price"
  | "product_image"
  | "order"
  | "delivery_assignment"
  | "customer"
  | "admin_session"
  | "market_price_update"
  | "system";

export type AuditLogAction =
  | "create"
  | "update"
  | "delete"
  | "import"
  | "export"
  | "price_update"
  | "image_update"
  | "market_ai_update"
  | "login"
  | "logout"
  | "view"
  | "other";

export type AuditLogStatus =
  | "success"
  | "partial"
  | "failed"
  | "cancelled";

export type AuditJsonValue =
  | string
  | number
  | boolean
  | null
  | AuditJsonValue[]
  | {
      [key: string]: AuditJsonValue;
    };

export interface AuditAdminSnapshot {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export interface CreateAuditLogData {
  module: AuditLogModule;
  entity: AuditLogEntity;
  entityId?: string | number | null;
  action: AuditLogAction;
  status?: AuditLogStatus;
  summary: string;
  oldValues?: Record<string, AuditJsonValue> | null;
  newValues?: Record<string, AuditJsonValue> | null;
  metadata?: Record<string, AuditJsonValue>;
  errorMessage?: string | null;
  durationMs?: number | null;
}

export interface AuditLogRecord {
  id: number;
  created_at: string;

  admin_id: string | null;
  admin_name: string | null;
  admin_email: string | null;
  admin_role: AdminRole | null;

  module: AuditLogModule;
  entity: AuditLogEntity;
  entity_id: string | null;

  action: AuditLogAction;
  status: AuditLogStatus;
  summary: string;

  old_values: Record<string, AuditJsonValue> | null;
  new_values: Record<string, AuditJsonValue> | null;
  metadata: Record<string, AuditJsonValue>;

  error_message: string | null;
  duration_ms: number | null;
}

export interface AuditLogFilters {
  search?: string;
  module?: AuditLogModule | "all";
  action?: AuditLogAction | "all";
  status?: AuditLogStatus | "all";
  adminId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface AuditLogStatistics {
  total: number;
  successful: number;
  partial: number;
  failed: number;
  imports: number;
  updates: number;
}