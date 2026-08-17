"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  calculateAuditStatistics,
  formatAuditDate,
  formatAuditDuration,
  getAuditLogs,
} from "@/services/auditLog";

import type {
  AuditLogAction,
  AuditLogModule,
  AuditLogRecord,
  AuditLogStatus,
} from "@/types/auditLog";

const MODULE_OPTIONS: Array<{
  value: AuditLogModule | "all";
  label: string;
}> = [
  { value: "all", label: "Todos los módulos" },
  { value: "catalog", label: "Catálogo" },
  { value: "products", label: "Productos" },
  { value: "prices", label: "Precios" },
  { value: "photos", label: "Fotografías" },
  { value: "orders", label: "Pedidos" },
  { value: "delivery", label: "Entregas" },
  { value: "customers", label: "Clientes" },
  { value: "security", label: "Seguridad" },
  { value: "market_ai", label: "Mercado IA" },
  { value: "system", label: "Sistema" },
];

const ACTION_OPTIONS: Array<{
  value: AuditLogAction | "all";
  label: string;
}> = [
  { value: "all", label: "Todas las acciones" },
  { value: "create", label: "Creación" },
  { value: "update", label: "Actualización" },
  { value: "delete", label: "Eliminación" },
  { value: "import", label: "Importación" },
  { value: "export", label: "Exportación" },
  { value: "price_update", label: "Actualización de precio" },
  { value: "image_update", label: "Actualización de imagen" },
  { value: "market_ai_update", label: "Actualización Mercado IA" },
  { value: "login", label: "Inicio de sesión" },
  { value: "logout", label: "Cierre de sesión" },
  { value: "view", label: "Consulta" },
  { value: "other", label: "Otra acción" },
];

const STATUS_OPTIONS: Array<{
  value: AuditLogStatus | "all";
  label: string;
}> = [
  { value: "all", label: "Todos los estados" },
  { value: "success", label: "Exitoso" },
  { value: "partial", label: "Parcial" },
  { value: "failed", label: "Fallido" },
  { value: "cancelled", label: "Cancelado" },
];

export default function Page() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] =
    useState<AuditLogModule | "all">("all");
  const [actionFilter, setActionFilter] =
    useState<AuditLogAction | "all">("all");
  const [statusFilter, setStatusFilter] =
    useState<AuditLogStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedLog, setSelectedLog] =
    useState<AuditLogRecord | null>(null);

  const loadLogs = useCallback(
    async (showRefreshing = false) => {
      try {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        const data = await getAuditLogs({
          search,
          module: moduleFilter,
          action: actionFilter,
          status: statusFilter,
          dateFrom: dateFrom
            ? `${dateFrom}T00:00:00-05:00`
            : undefined,
          dateTo: dateTo
            ? `${dateTo}T23:59:59-05:00`
            : undefined,
          limit: 300,
        });

        setLogs(data);
      } catch (error) {
        console.error(
          "Error cargando el Centro de Actividad:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar el historial del catálogo."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      actionFilter,
      dateFrom,
      dateTo,
      moduleFilter,
      search,
      statusFilter,
    ]
  );

  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        void loadLogs();
      },
      search ? 350 : 0
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loadLogs, search]);

  const statistics = useMemo(
    () => calculateAuditStatistics(logs),
    [logs]
  );

  function clearFilters() {
    setSearch("");
    setModuleFilter("all");
    setActionFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  }

  function exportActivityCsv() {
    if (logs.length === 0) {
      return;
    }

    const headers = [
      "Fecha",
      "Administrador",
      "Correo",
      "Rol",
      "Módulo",
      "Acción",
      "Estado",
      "Resumen",
      "Entidad",
      "Entidad ID",
      "Duración",
      "Error",
    ];

    const rows = logs.map((log) => [
      formatAuditDate(log.created_at),
      log.admin_name ?? "",
      log.admin_email ?? "",
      log.admin_role ?? "",
      getModuleLabel(log.module),
      getActionLabel(log.action),
      getStatusLabel(log.status),
      log.summary,
      log.entity,
      log.entity_id ?? "",
      formatAuditDuration(log.duration_ms),
      log.error_message ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF", csv],
      {
        type: "text/csv;charset=utf-8",
      }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `historial-catalogo-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <section className="overflow-hidden rounded-[32px] bg-zinc-950 text-white shadow-2xl">
          <div className="relative px-6 py-8 sm:px-8 lg:px-10">
            <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.24),transparent_68%)] lg:block" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-green-400">
                  Trazabilidad comercial
                </p>

                <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  Centro de Actividad
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base">
                  Consulta importaciones, modificaciones y operaciones
                  registradas en el catálogo de MercaNova GO.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    void loadLogs(true)
                  }
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshIcon
                    spinning={refreshing}
                  />
                  {refreshing
                    ? "Actualizando..."
                    : "Actualizar"}
                </button>

                <button
                  type="button"
                  onClick={exportActivityCsv}
                  disabled={logs.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                >
                  <DownloadIcon />
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard
            label="Actividad total"
            value={statistics.total}
            helper="Registros encontrados"
          />

          <StatCard
            label="Exitosos"
            value={statistics.successful}
            helper="Operaciones completadas"
          />

          <StatCard
            label="Parciales"
            value={statistics.partial}
            helper="Con observaciones"
          />

          <StatCard
            label="Fallidos"
            value={statistics.failed}
            helper="Requieren revisión"
          />

          <StatCard
            label="Importaciones"
            value={statistics.imports}
            helper="Archivos procesados"
          />

          <StatCard
            label="Actualizaciones"
            value={statistics.updates}
            helper="Cambios registrados"
          />
        </section>

        <section className="mt-6 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-green-600">
                Filtros avanzados
              </p>

              <h2 className="mt-2 text-xl font-black text-zinc-950">
                Buscar actividad
              </h2>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="text-left text-sm font-black text-zinc-500 transition hover:text-zinc-950 xl:text-right"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <label className="xl:col-span-2">
              <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-500">
                Búsqueda
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Archivo, administrador, resumen..."
                className="h-12 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm font-bold text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
              />
            </label>

            <FilterSelect
              label="Módulo"
              value={moduleFilter}
              options={MODULE_OPTIONS}
              onChange={(value) =>
                setModuleFilter(
                  value as AuditLogModule | "all"
                )
              }
            />

            <FilterSelect
              label="Acción"
              value={actionFilter}
              options={ACTION_OPTIONS}
              onChange={(value) =>
                setActionFilter(
                  value as AuditLogAction | "all"
                )
              }
            />

            <FilterSelect
              label="Estado"
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={(value) =>
                setStatusFilter(
                  value as AuditLogStatus | "all"
                )
              }
            />

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
              <DateInput
                label="Desde"
                value={dateFrom}
                onChange={setDateFrom}
              />

              <DateInput
                label="Hasta"
                value={dateTo}
                onChange={setDateTo}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-zinc-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                Historial
              </p>

              <h2 className="mt-1 text-xl font-black text-zinc-950">
                Actividad registrada
              </h2>
            </div>

            <p className="text-sm font-bold text-zinc-500">
              {logs.length} registros visibles
            </p>
          </div>

          {loading ? (
            <LoadingState />
          ) : errorMessage ? (
            <ErrorState
              message={errorMessage}
              onRetry={() =>
                void loadLogs()
              }
            />
          ) : logs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-zinc-200">
              {logs.map((log) => (
                <ActivityRow
                  key={log.id}
                  log={log}
                  onOpen={() =>
                    setSelectedLog(log)
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedLog && (
        <ActivityDetailModal
          log={selectedLog}
          onClose={() =>
            setSelectedLog(null)
          }
        />
      )}
    </main>
  );
}

interface ActivityRowProps {
  log: AuditLogRecord;
  onOpen: () => void;
}

function ActivityRow({
  log,
  onOpen,
}: ActivityRowProps) {
  const statusAppearance =
    getStatusAppearance(log.status);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid w-full gap-4 px-5 py-5 text-left transition hover:bg-zinc-50 sm:px-6 lg:grid-cols-[minmax(0,1fr)_180px_170px_120px] lg:items-center"
    >
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white">
          <ActivityIcon
            action={log.action}
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-zinc-600">
              {getModuleLabel(
                log.module
              )}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${statusAppearance.badge}`}
            >
              {statusAppearance.label}
            </span>
          </div>

          <h3 className="mt-3 truncate text-base font-black text-zinc-950">
            {log.summary}
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            {getActionLabel(
              log.action
            )}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
          Responsable
        </p>

        <p className="mt-1 truncate text-sm font-black text-zinc-900">
          {log.admin_name ??
            "Administrador"}
        </p>

        <p className="mt-1 truncate text-xs text-zinc-500">
          {log.admin_email ??
            "Correo no disponible"}
        </p>
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
          Fecha
        </p>

        <p className="mt-1 text-sm font-black text-zinc-900">
          {formatAuditDate(
            log.created_at
          )}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <div className="lg:text-right">
          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
            Duración
          </p>

          <p className="mt-1 text-sm font-black text-zinc-900">
            {formatAuditDuration(
              log.duration_ms
            )}
          </p>
        </div>

        <ChevronIcon />
      </div>
    </button>
  );
}

interface ActivityDetailModalProps {
  log: AuditLogRecord;
  onClose: () => void;
}

function ActivityDetailModal({
  log,
  onClose,
}: ActivityDetailModalProps) {
  const statusAppearance =
    getStatusAppearance(log.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/70 px-4 py-6 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-[30px] bg-white shadow-2xl">
          <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-6 text-white sm:px-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-green-400">
                  Detalle de actividad
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {log.summary}
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
                    {getModuleLabel(
                      log.module
                    )}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${statusAppearance.badge}`}
                  >
                    {statusAppearance.label}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar detalle"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl font-black text-white transition hover:bg-white/20"
              >
                ×
              </button>
            </div>
          </header>

          <div className="max-h-[calc(100vh-120px)] overflow-y-auto p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailCard
                label="Administrador"
                value={
                  log.admin_name ??
                  "No disponible"
                }
              />

              <DetailCard
                label="Acción"
                value={getActionLabel(
                  log.action
                )}
              />

              <DetailCard
                label="Fecha"
                value={formatAuditDate(
                  log.created_at
                )}
              />

              <DetailCard
                label="Duración"
                value={formatAuditDuration(
                  log.duration_ms
                )}
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <JsonPanel
                title="Valores anteriores"
                value={log.old_values}
                emptyMessage="No se registraron valores anteriores."
              />

              <JsonPanel
                title="Valores nuevos"
                value={log.new_values}
                emptyMessage="No se registraron valores nuevos."
              />
            </div>

            <div className="mt-6">
              <JsonPanel
                title="Metadatos de la operación"
                value={log.metadata}
                emptyMessage="No existen metadatos adicionales."
              />
            </div>

            {log.error_message && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-wider text-red-500">
                  Error registrado
                </p>

                <p className="mt-2 text-sm font-bold leading-6 text-red-700">
                  {log.error_message}
                </p>
              </div>
            )}

            <footer className="mt-8 flex justify-end border-t border-zinc-200 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl bg-zinc-950 px-7 py-3 text-sm font-black text-white transition hover:bg-zinc-800"
              >
                Cerrar detalle
              </button>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
}

interface JsonPanelProps {
  title: string;
  value:
    | Record<string, unknown>
    | null;
  emptyMessage: string;
}

function JsonPanel({
  title,
  value,
  emptyMessage,
}: JsonPanelProps) {
  const hasContent =
    value &&
    Object.keys(value).length > 0;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </p>

      {hasContent ? (
        <pre className="mt-4 max-h-[360px] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-zinc-950 p-4 text-xs leading-6 text-zinc-200">
          {JSON.stringify(
            value,
            null,
            2
          )}
        </pre>
      ) : (
        <p className="mt-4 text-sm font-bold text-zinc-400">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  onChange: (value: string) => void;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-12 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm font-black text-zinc-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function DateInput({
  label,
  value,
  onChange,
}: DateInputProps) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-500">
        {label}
      </span>

      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-12 w-full rounded-2xl border border-zinc-300 bg-white px-3 text-sm font-black text-zinc-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
      />
    </label>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  helper: string;
}

function StatCard({
  label,
  value,
  helper,
}: StatCardProps) {
  return (
    <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>

      <p className="mt-3 text-3xl font-black text-zinc-950">
        {value}
      </p>

      <p className="mt-2 text-xs font-bold text-zinc-500">
        {helper}
      </p>
    </div>
  );
}

interface DetailCardProps {
  label: string;
  value: string;
}

function DetailCard({
  label,
  value,
}: DetailCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-black text-zinc-900">
        {value}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-14 text-center">
      <div className="h-11 w-11 animate-spin rounded-full border-4 border-zinc-200 border-t-green-500" />

      <p className="mt-5 font-black text-zinc-900">
        Cargando actividad...
      </p>

      <p className="mt-2 text-sm text-zinc-500">
        Consultando los registros de auditoría.
      </p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-700">
        !
      </div>

      <p className="mt-5 text-lg font-black text-zinc-900">
        No fue posible cargar la actividad
      </p>

      <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-black text-white transition hover:bg-zinc-800"
      >
        Reintentar
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
        <ActivityIcon action="view" />
      </div>

      <p className="mt-5 text-lg font-black text-zinc-900">
        No existen registros para estos filtros
      </p>

      <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
        Realiza una importación o modifica los filtros para consultar
        otras operaciones.
      </p>
    </div>
  );
}

function getModuleLabel(
  module: AuditLogModule
): string {
  return (
    MODULE_OPTIONS.find(
      (option) =>
        option.value === module
    )?.label ?? module
  );
}

function getActionLabel(
  action: AuditLogAction
): string {
  return (
    ACTION_OPTIONS.find(
      (option) =>
        option.value === action
    )?.label ?? action
  );
}

function getStatusLabel(
  status: AuditLogStatus
): string {
  return (
    STATUS_OPTIONS.find(
      (option) =>
        option.value === status
    )?.label ?? status
  );
}

function getStatusAppearance(
  status: AuditLogStatus
) {
  if (status === "success") {
    return {
      label: "Exitoso",
      badge:
        "bg-green-100 text-green-700",
    };
  }

  if (status === "partial") {
    return {
      label: "Parcial",
      badge:
        "bg-amber-100 text-amber-700",
    };
  }

  if (status === "failed") {
    return {
      label: "Fallido",
      badge:
        "bg-red-100 text-red-700",
    };
  }

  return {
    label: "Cancelado",
    badge:
      "bg-zinc-200 text-zinc-700",
  };
}

function ActivityIcon({
  action,
}: {
  action: AuditLogAction;
}) {
  if (action === "import") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path
          d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (
    action === "update" ||
    action === "price_update" ||
    action === "image_update" ||
    action === "market_ai_update"
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path
          d="M4 20h4l11-11a2.8 2.8 0 1 0-4-4L4 16v4ZM13.5 6.5l4 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path
        d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon({
  spinning,
}: {
  spinning: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-5 w-5 ${
        spinning
          ? "animate-spin"
          : ""
      }`}
      aria-hidden="true"
    >
      <path
        d="M20 11a8 8 0 1 0-2.34 5.66M20 11V5m0 6h-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 text-zinc-400"
      aria-hidden="true"
    >
      <path
        d="m9 18 6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}