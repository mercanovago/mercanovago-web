import { supabase } from "@/lib/supabase";

import {
  getCurrentAdmin,
  getStoredAdminCompatibilitySession,
} from "@/services/adminLogin";

import type {
  AuditAdminSnapshot,
  AuditLogFilters,
  AuditLogRecord,
  AuditLogStatistics,
  CreateAuditLogData,
} from "@/types/auditLog";

const DEFAULT_AUDIT_LIMIT = 100;
const MAX_AUDIT_LIMIT = 500;

function normalizeLimit(
  requestedLimit?: number
): number {
  if (
    !requestedLimit ||
    !Number.isFinite(requestedLimit)
  ) {
    return DEFAULT_AUDIT_LIMIT;
  }

  return Math.min(
    Math.max(
      Math.trunc(requestedLimit),
      1
    ),
    MAX_AUDIT_LIMIT
  );
}

function normalizeEntityId(
  entityId:
    | string
    | number
    | null
    | undefined
): string | null {
  if (
    entityId === null ||
    entityId === undefined
  ) {
    return null;
  }

  const normalized = String(
    entityId
  ).trim();

  return normalized || null;
}

function normalizeOptionalText(
  value:
    | string
    | null
    | undefined
): string | null {
  const normalized = String(
    value ?? ""
  ).trim();

  return normalized || null;
}

async function resolveCurrentAdmin():
  Promise<AuditAdminSnapshot> {
  const currentAdmin =
    await getCurrentAdmin();

  if (currentAdmin) {
    return {
      id: currentAdmin.id,
      name: currentAdmin.name,
      email: currentAdmin.email,
      role: currentAdmin.role,
    };
  }

  const storedAdmin =
    getStoredAdminCompatibilitySession();

  if (storedAdmin) {
    return {
      id: storedAdmin.id,
      name: storedAdmin.name,
      email: storedAdmin.email,
      role: storedAdmin.role,
    };
  }

  throw new Error(
    "No fue posible identificar al administrador responsable de la operación."
  );
}

export async function createAuditLog(
  input: CreateAuditLogData
): Promise<AuditLogRecord> {
  const admin =
    await resolveCurrentAdmin();

  const summary =
    input.summary.trim();

  if (!summary) {
    throw new Error(
      "El registro de auditoría necesita un resumen."
    );
  }

  const durationMs =
    input.durationMs === null ||
    input.durationMs === undefined
      ? null
      : Math.max(
          0,
          Math.trunc(
            input.durationMs
          )
        );

  const payload = {
    admin_id: admin.id,
    admin_name: admin.name,
    admin_email: admin.email,
    admin_role: admin.role,

    module: input.module,
    entity: input.entity,
    entity_id:
      normalizeEntityId(
        input.entityId
      ),

    action: input.action,
    status:
      input.status ?? "success",

    summary,

    old_values:
      input.oldValues ?? null,

    new_values:
      input.newValues ?? null,

    metadata:
      input.metadata ?? {},

    error_message:
      normalizeOptionalText(
        input.errorMessage
      ),

    duration_ms: durationMs,
  };

  const { data, error } =
    await supabase
      .from("audit_logs")
      .insert(payload)
      .select(
        `
          id,
          created_at,
          admin_id,
          admin_name,
          admin_email,
          admin_role,
          module,
          entity,
          entity_id,
          action,
          status,
          summary,
          old_values,
          new_values,
          metadata,
          error_message,
          duration_ms
        `
      )
      .single();

  if (error) {
    console.error(
      "Error creando registro de auditoría:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    throw new Error(
      "La operación se completó, pero no fue posible guardar su registro de auditoría."
    );
  }

  return data as AuditLogRecord;
}

export async function tryCreateAuditLog(
  input: CreateAuditLogData
): Promise<AuditLogRecord | null> {
  try {
    return await createAuditLog(
      input
    );
  } catch (error) {
    /*
     * La auditoría no debe revertir una operación
     * comercial que ya terminó correctamente.
     */
    console.error(
      "No fue posible registrar la auditoría:",
      error
    );

    return null;
  }
}

export async function getAuditLogs(
  filters: AuditLogFilters = {}
): Promise<AuditLogRecord[]> {
  const limit =
    normalizeLimit(filters.limit);

  let query = supabase
    .from("audit_logs")
    .select(
      `
        id,
        created_at,
        admin_id,
        admin_name,
        admin_email,
        admin_role,
        module,
        entity,
        entity_id,
        action,
        status,
        summary,
        old_values,
        new_values,
        metadata,
        error_message,
        duration_ms
      `
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(limit);

  if (
    filters.module &&
    filters.module !== "all"
  ) {
    query = query.eq(
      "module",
      filters.module
    );
  }

  if (
    filters.action &&
    filters.action !== "all"
  ) {
    query = query.eq(
      "action",
      filters.action
    );
  }

  if (
    filters.status &&
    filters.status !== "all"
  ) {
    query = query.eq(
      "status",
      filters.status
    );
  }

  if (filters.adminId) {
    query = query.eq(
      "admin_id",
      filters.adminId
    );
  }

  if (filters.dateFrom) {
    query = query.gte(
      "created_at",
      filters.dateFrom
    );
  }

  if (filters.dateTo) {
    query = query.lte(
      "created_at",
      filters.dateTo
    );
  }

  const search =
    filters.search?.trim();

  if (search) {
    const safeSearch =
      search
        .replace(/[%_,()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (safeSearch) {
      query = query.or(
        [
          `summary.ilike.%${safeSearch}%`,
          `admin_name.ilike.%${safeSearch}%`,
          `admin_email.ilike.%${safeSearch}%`,
          `entity_id.ilike.%${safeSearch}%`,
        ].join(",")
      );
    }
  }

  const { data, error } =
    await query;

  if (error) {
    console.error(
      "Error consultando historial de auditoría:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    throw new Error(
      "No fue posible cargar el Centro de Actividad."
    );
  }

  return (
    data ?? []
  ) as AuditLogRecord[];
}

export async function getAuditLogById(
  auditLogId: number
): Promise<AuditLogRecord | null> {
  if (
    !Number.isInteger(auditLogId) ||
    auditLogId <= 0
  ) {
    throw new Error(
      "El identificador del registro de auditoría no es válido."
    );
  }

  const { data, error } =
    await supabase
      .from("audit_logs")
      .select(
        `
          id,
          created_at,
          admin_id,
          admin_name,
          admin_email,
          admin_role,
          module,
          entity,
          entity_id,
          action,
          status,
          summary,
          old_values,
          new_values,
          metadata,
          error_message,
          duration_ms
        `
      )
      .eq("id", auditLogId)
      .maybeSingle();

  if (error) {
    console.error(
      "Error consultando detalle de auditoría:",
      error
    );

    throw new Error(
      "No fue posible cargar el detalle de la actividad."
    );
  }

  return data
    ? (data as AuditLogRecord)
    : null;
}

export function calculateAuditStatistics(
  logs: AuditLogRecord[]
): AuditLogStatistics {
  return {
    total: logs.length,

    successful: logs.filter(
      (log) =>
        log.status === "success"
    ).length,

    partial: logs.filter(
      (log) =>
        log.status === "partial"
    ).length,

    failed: logs.filter(
      (log) =>
        log.status === "failed"
    ).length,

    imports: logs.filter(
      (log) =>
        log.action === "import"
    ).length,

    updates: logs.filter(
      (log) =>
        log.action === "update" ||
        log.action ===
          "price_update" ||
        log.action ===
          "image_update" ||
        log.action ===
          "market_ai_update"
    ).length,
  };
}

export function formatAuditDate(
  isoDate: string
): string {
  const date = new Date(isoDate);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat(
    "es-EC",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone:
        "America/Guayaquil",
    }
  ).format(date);
}

export function formatAuditDuration(
  durationMs:
    | number
    | null
): string {
  if (
    durationMs === null ||
    !Number.isFinite(durationMs)
  ) {
    return "No registrada";
  }

  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  const seconds =
    durationMs / 1000;

  if (seconds < 60) {
    return `${seconds.toFixed(1)} s`;
  }

  const minutes =
    Math.floor(seconds / 60);

  const remainingSeconds =
    Math.round(
      seconds % 60
    );

  return `${minutes} min ${remainingSeconds} s`;
}