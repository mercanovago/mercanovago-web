"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AdminGuard from "@/components/admin/AdminGuard";

import {
  getDashboardStats,
  getEmptyDashboardStats,
  type DashboardStats,
  type OrderStatusSummary,
  type SalesChartPoint,
  type StatsPeriod,
  type TopProductSummary,
} from "@/services/adminStats";

const PERIOD_OPTIONS: Array<{
  value: StatsPeriod;
  label: string;
}> = [
  {
    value: "today",
    label: "Hoy",
  },
  {
    value: "week",
    label: "Esta semana",
  },
  {
    value: "month",
    label: "Este mes",
  },
  {
    value: "all",
    label: "Histórico",
  },
];

export default function AdminStatsPage() {
  const [stats, setStats] = useState<DashboardStats>(
    getEmptyDashboardStats()
  );

  const [period, setPeriod] = useState<StatsPeriod>("month");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStats = useCallback(
    async (showFullLoader = false) => {
      try {
        if (showFullLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setErrorMessage("");

        const data = await getDashboardStats(period);

        setStats(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error(
          "Error cargando Estadísticas Premium:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar las estadísticas."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period]
  );

  useEffect(() => {
    void loadStats(true);
  }, [loadStats]);

  const periodLabel =
    PERIOD_OPTIONS.find((option) => option.value === period)?.label ??
    "Período seleccionado";

  const completionRate = useMemo(() => {
    const operativeOrders = stats.orders - stats.cancelled;

    if (operativeOrders <= 0) {
      return 0;
    }

    return (stats.delivered / operativeOrders) * 100;
  }, [stats.cancelled, stats.delivered, stats.orders]);

  const cancellationRate = useMemo(() => {
    if (stats.orders <= 0) {
      return 0;
    }

    return (stats.cancelled / stats.orders) * 100;
  }, [stats.cancelled, stats.orders]);

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#f3f5f3] px-4 py-6 text-zinc-950 sm:px-6 sm:py-10 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <header className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[1fr_auto]">
              <div className="relative overflow-hidden bg-zinc-950 px-6 py-8 text-white sm:px-9 lg:px-12 lg:py-10">
                <div
                  aria-hidden="true"
                  className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-500/20 blur-3xl"
                />

                <div className="relative">
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-sm font-black text-green-300 transition hover:text-white"
                  >
                    <BackIcon />
                    Volver al panel
                  </Link>

                  <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-green-300">
                    MercaNova GO · Inteligencia comercial
                  </p>

                  <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                    Centro de Estadísticas Premium
                  </h1>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
                    Visualiza ventas, pedidos, clientes, productos y
                    rendimiento operativo desde un único centro de control.
                  </p>
                </div>
              </div>

              <div className="flex min-w-[320px] flex-col justify-center gap-4 p-6 sm:p-8">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                    Período de análisis
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {PERIOD_OPTIONS.map((option) => {
                      const selected = option.value === period;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPeriod(option.value)}
                          className={`rounded-xl px-4 py-3 text-sm font-black transition ${
                            selected
                              ? "bg-green-600 text-white shadow-lg shadow-green-900/15"
                              : "border border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void loadStats(false)}
                  disabled={refreshing || loading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-black text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshIcon spinning={refreshing} />

                  {refreshing
                    ? "Actualizando..."
                    : "Actualizar información"}
                </button>

                <p className="text-center text-[11px] font-bold text-zinc-400">
                  {lastUpdated
                    ? `Actualizado ${formatTime(lastUpdated)}`
                    : "Esperando primera actualización"}
                </p>
              </div>
            </div>
          </header>

          {errorMessage && (
            <ErrorPanel
              message={errorMessage}
              onRetry={() => void loadStats(true)}
            />
          )}

          {loading ? (
            <DashboardLoading />
          ) : (
            <div className="mt-7 space-y-7">
              <ExecutiveSummary
                stats={stats}
                periodLabel={periodLabel}
              />

              <div className="grid gap-7 xl:grid-cols-[1.45fr_0.75fr]">
                <SalesChart data={stats.salesChart} />

                <OperationalHealth
                  completionRate={completionRate}
                  cancellationRate={cancellationRate}
                  stats={stats}
                />
              </div>

              <div className="grid gap-7 xl:grid-cols-[0.9fr_1.1fr]">
                <OrderStatusPanel
                  statuses={stats.statusSummary}
                  totalOrders={stats.orders}
                />

                <TopProductsPanel products={stats.topProducts} />
              </div>

              <InventoryAndCustomers stats={stats} />
            </div>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}

interface ExecutiveSummaryProps {
  stats: DashboardStats;
  periodLabel: string;
}

function ExecutiveSummary({
  stats,
  periodLabel,
}: ExecutiveSummaryProps) {
  const cards = [
    {
      title: "Ventas del período",
      value: formatMoney(stats.sales),
      note: periodLabel,
      icon: <MoneyIcon />,
      accent: "green",
    },
    {
      title: "Pedidos",
      value: formatNumber(stats.orders),
      note: `${stats.validOrders} válidos`,
      icon: <OrderIcon />,
      accent: "blue",
    },
    {
      title: "Ticket promedio",
      value: formatMoney(stats.averageTicket),
      note: "Por pedido válido",
      icon: <TicketIcon />,
      accent: "violet",
    },
    {
      title: "Ventas hoy",
      value: formatMoney(stats.salesToday),
      note: "Jornada actual",
      icon: <CalendarIcon />,
      accent: "amber",
    },
  ];

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">
            Resumen ejecutivo
          </p>

          <h2 className="mt-1 text-2xl font-black">
            Indicadores principales
          </h2>
        </div>

        <span className="hidden rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-black text-green-700 sm:block">
          Datos conectados con Supabase
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard
            key={card.title}
            {...card}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <CompactMetric
          label="Ventas de la semana"
          value={formatMoney(stats.salesWeek)}
        />

        <CompactMetric
          label="Ventas del mes"
          value={formatMoney(stats.salesMonth)}
        />

        <CompactMetric
          label="Clientes registrados"
          value={formatNumber(stats.customers)}
        />
      </div>
    </section>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  note: string;
  icon: React.ReactNode;
  accent: string;
}

function MetricCard({
  title,
  value,
  note,
  icon,
  accent,
}: MetricCardProps) {
  const accentClasses: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    violet: "bg-violet-100 text-violet-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <article className="group rounded-[1.75rem] border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            accentClasses[accent] ?? accentClasses.green
          }`}
        >
          {icon}
        </span>

        <span className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-500">
          En vivo
        </span>
      </div>

      <p className="mt-6 text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
        {title}
      </p>

      <p className="mt-2 break-words text-3xl font-black tracking-tight sm:text-4xl">
        {value}
      </p>

      <p className="mt-2 text-xs font-bold text-zinc-500">{note}</p>
    </article>
  );
}

interface CompactMetricProps {
  label: string;
  value: string;
}

function CompactMetric({
  label,
  value,
}: CompactMetricProps) {
  return (
    <article className="flex items-center justify-between gap-5 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-sm font-bold text-zinc-500">{label}</p>

      <p className="text-xl font-black text-green-600">{value}</p>
    </article>
  );
}

interface SalesChartProps {
  data: SalesChartPoint[];
}

function SalesChart({ data }: SalesChartProps) {
  const maximumSales = Math.max(
    ...data.map((item) => item.sales),
    1
  );

  const totalSevenDays = data.reduce(
    (total, item) => total + item.sales,
    0
  );

  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">
            Comportamiento comercial
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Ventas de los últimos 7 días
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Ingresos registrados, excluyendo pedidos cancelados.
          </p>
        </div>

        <div className="rounded-2xl bg-green-50 px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-green-700">
            Acumulado
          </p>

          <p className="mt-1 text-2xl font-black text-green-700">
            {formatMoney(totalSevenDays)}
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState
          title="Todavía no existen datos de ventas"
          description="Los movimientos diarios aparecerán cuando se registren pedidos."
        />
      ) : (
        <div className="mt-8 overflow-x-auto pb-2">
          <div className="flex min-w-[620px] items-end gap-3">
            {data.map((item) => {
              const barHeight =
                item.sales > 0
                  ? Math.max((item.sales / maximumSales) * 220, 16)
                  : 6;

              return (
                <div
                  key={item.date}
                  className="flex min-w-0 flex-1 flex-col items-center"
                >
                  <div className="mb-2 h-6 text-center text-xs font-black text-zinc-700">
                    {item.sales > 0
                      ? formatCompactMoney(item.sales)
                      : "—"}
                  </div>

                  <div className="flex h-[230px] w-full items-end justify-center rounded-2xl bg-zinc-50 px-2 pt-3">
                    <div
                      title={`${item.label}: ${formatMoney(
                        item.sales
                      )} · ${item.orders} pedidos`}
                      style={{
                        height: `${barHeight}px`,
                      }}
                      className={`w-full max-w-12 rounded-t-xl transition-all ${
                        item.sales > 0
                          ? "bg-gradient-to-t from-green-700 to-green-400 shadow-lg shadow-green-900/10"
                          : "bg-zinc-200"
                      }`}
                    />
                  </div>

                  <p className="mt-3 text-xs font-black capitalize text-zinc-600">
                    {item.label}
                  </p>

                  <p className="mt-1 text-[10px] font-bold text-zinc-400">
                    {item.orders} pedido
                    {item.orders === 1 ? "" : "s"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

interface OperationalHealthProps {
  completionRate: number;
  cancellationRate: number;
  stats: DashboardStats;
}

function OperationalHealth({
  completionRate,
  cancellationRate,
  stats,
}: OperationalHealthProps) {
  const activeOrders =
    stats.pending +
    stats.confirmed +
    stats.preparing +
    stats.packing +
    stats.onWay;

  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-sm sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-green-300">
        Salud operativa
      </p>

      <h2 className="mt-2 text-2xl font-black">
        Rendimiento de pedidos
      </h2>

      <div className="mt-8 space-y-6">
        <ProgressMetric
          label="Tasa de entrega"
          value={completionRate}
          description={`${stats.delivered} pedidos entregados`}
          tone="green"
        />

        <ProgressMetric
          label="Tasa de cancelación"
          value={cancellationRate}
          description={`${stats.cancelled} pedidos cancelados`}
          tone="red"
        />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
            Pedidos activos
          </p>

          <p className="mt-2 text-3xl font-black text-green-300">
            {activeOrders}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
            Finalizados
          </p>

          <p className="mt-2 text-3xl font-black">
            {stats.delivered + stats.cancelled}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/10 p-4">
        <p className="text-xs font-black text-green-200">
          Lectura operativa MercaNova GO
        </p>

        <p className="mt-2 text-xs leading-6 text-zinc-300">
          {getOperationalMessage(
            stats.orders,
            completionRate,
            cancellationRate
          )}
        </p>
      </div>
    </section>
  );
}

interface ProgressMetricProps {
  label: string;
  value: number;
  description: string;
  tone: "green" | "red";
}

function ProgressMetric({
  label,
  value,
  description,
  tone,
}: ProgressMetricProps) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-black">{label}</p>

          <p className="mt-1 text-xs text-zinc-400">{description}</p>
        </div>

        <p
          className={`text-2xl font-black ${
            tone === "green"
              ? "text-green-300"
              : "text-red-300"
          }`}
        >
          {safeValue.toFixed(1)}%
        </p>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          style={{
            width: `${safeValue}%`,
          }}
          className={`h-full rounded-full transition-all ${
            tone === "green"
              ? "bg-green-400"
              : "bg-red-400"
          }`}
        />
      </div>
    </div>
  );
}

interface OrderStatusPanelProps {
  statuses: OrderStatusSummary[];
  totalOrders: number;
}

function OrderStatusPanel({
  statuses,
  totalOrders,
}: OrderStatusPanelProps) {
  const maximum = Math.max(
    ...statuses.map((status) => status.count),
    1
  );

  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">
        Flujo de operación
      </p>

      <div className="mt-2 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-black">
          Pedidos por estado
        </h2>

        <span className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-black text-zinc-600">
          {totalOrders} en total
        </span>
      </div>

      {totalOrders === 0 ? (
        <EmptyState
          title="No existen pedidos en este período"
          description="Selecciona otro período o registra un nuevo pedido."
        />
      ) : (
        <div className="mt-7 space-y-5">
          {statuses.map((status) => {
            const width =
              status.count > 0
                ? Math.max((status.count / maximum) * 100, 5)
                : 0;

            return (
              <div key={status.key}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${getStatusDotClass(
                        status.key
                      )}`}
                    />

                    <p className="text-sm font-black text-zinc-700">
                      {status.label}
                    </p>
                  </div>

                  <p className="text-sm font-black">
                    {status.count}
                  </p>
                </div>

                <div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    style={{
                      width: `${width}%`,
                    }}
                    className={`h-full rounded-full transition-all ${getStatusBarClass(
                      status.key
                    )}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

interface TopProductsPanelProps {
  products: TopProductSummary[];
}

function TopProductsPanel({
  products,
}: TopProductsPanelProps) {
  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">
            Rendimiento del catálogo
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Productos más vendidos
          </h2>
        </div>

        <span className="text-xs font-bold text-zinc-400">
          Clasificación por unidades
        </span>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Todavía no hay productos vendidos"
          description="La clasificación se generará desde los artículos de cada pedido."
        />
      ) : (
        <div className="mt-7 overflow-hidden rounded-2xl border border-zinc-200">
          <div className="hidden grid-cols-[60px_1fr_130px_140px] bg-zinc-950 px-5 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-300 sm:grid">
            <span>Posición</span>
            <span>Producto</span>
            <span>Unidades</span>
            <span>Ventas</span>
          </div>

          {products.map((product, index) => (
            <div
              key={product.productId}
              className="grid gap-4 border-t border-zinc-100 px-5 py-5 first:border-t-0 sm:grid-cols-[60px_1fr_130px_140px] sm:items-center"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 font-black text-green-700">
                {index + 1}
              </span>

              <div>
                <p className="font-black text-zinc-900">
                  {product.name}
                </p>

                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  {product.category}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 sm:hidden">
                  Unidades
                </p>

                <p className="mt-1 text-lg font-black sm:mt-0">
                  {formatQuantity(product.quantity)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 sm:hidden">
                  Ventas
                </p>

                <p className="mt-1 text-lg font-black text-green-600 sm:mt-0">
                  {formatMoney(product.sales)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface InventoryAndCustomersProps {
  stats: DashboardStats;
}

function InventoryAndCustomers({
  stats,
}: InventoryAndCustomersProps) {
  const productAvailabilityRate =
    stats.products > 0
      ? (stats.availableProducts / stats.products) * 100
      : 0;

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">
          Catálogo y comunidad
        </p>

        <h2 className="mt-1 text-2xl font-black">
          Inventario y clientes
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          label="Productos registrados"
          value={formatNumber(stats.products)}
          description="Catálogo total"
          icon={<ProductIcon />}
        />

        <InfoCard
          label="Productos disponibles"
          value={formatNumber(stats.availableProducts)}
          description={`${productAvailabilityRate.toFixed(
            1
          )}% del catálogo`}
          icon={<AvailableIcon />}
        />

        <InfoCard
          label="Productos sin stock"
          value={formatNumber(stats.outOfStockProducts)}
          description={
            stats.outOfStockProducts > 0
              ? "Requieren revisión"
              : "Inventario saludable"
          }
          icon={<WarningIcon />}
          warning={stats.outOfStockProducts > 0}
        />

        <InfoCard
          label="Clientes nuevos"
          value={formatNumber(stats.newCustomersThisMonth)}
          description="Registrados este mes"
          icon={<CustomerIcon />}
        />
      </div>
    </section>
  );
}

interface InfoCardProps {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  warning?: boolean;
}

function InfoCard({
  label,
  value,
  description,
  icon,
  warning = false,
}: InfoCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-zinc-200 bg-white p-6 shadow-sm">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
          warning
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {icon}
      </span>

      <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </p>

      <p
        className={`mt-2 text-4xl font-black ${
          warning ? "text-red-600" : "text-zinc-950"
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs font-bold text-zinc-500">
        {description}
      </p>
    </article>
  );
}

interface ErrorPanelProps {
  message: string;
  onRetry: () => void;
}

function ErrorPanel({
  message,
  onRetry,
}: ErrorPanelProps) {
  return (
    <section className="mt-7 rounded-[1.75rem] border border-red-200 bg-red-50 p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <WarningIcon />
          </span>

          <div>
            <h2 className="font-black text-red-950">
              No fue posible cargar toda la información
            </h2>

            <p className="mt-1 text-sm leading-6 text-red-800">
              {message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white transition hover:bg-red-800"
        >
          Volver a intentar
        </button>
      </div>
    </section>
  );
}

function DashboardLoading() {
  return (
    <section className="mt-7 rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-sm">
      <span className="mx-auto block h-14 w-14 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

      <h2 className="mt-6 text-2xl font-black">
        Preparando inteligencia comercial
      </h2>

      <p className="mt-2 text-sm text-zinc-500">
        Consultando ventas, pedidos, clientes y productos de MercaNova GO.
      </p>
    </section>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
}

function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="mt-7 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-zinc-400 shadow-sm">
        <ChartIcon />
      </span>

      <p className="mt-4 font-black text-zinc-700">{title}</p>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatCompactMoney(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }

  return `$${value.toFixed(2)}`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-EC").format(
    Number.isFinite(value) ? value : 0
  );
}

function formatQuantity(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getOperationalMessage(
  orders: number,
  completionRate: number,
  cancellationRate: number
): string {
  if (orders === 0) {
    return "Aún no hay pedidos suficientes para generar una lectura operativa.";
  }

  if (cancellationRate >= 20) {
    return "La cancelación es elevada. Conviene revisar disponibilidad, tiempos de confirmación y comunicación con el cliente.";
  }

  if (completionRate >= 80) {
    return "La operación presenta un nivel favorable de cumplimiento en los pedidos procesados.";
  }

  return "La operación está activa. El indicador mejorará conforme los pedidos pendientes avancen hasta su entrega.";
}

function getStatusDotClass(key: string): string {
  const classes: Record<string, string> = {
    pending: "bg-amber-400",
    confirmed: "bg-sky-500",
    preparing: "bg-orange-500",
    packing: "bg-violet-500",
    onWay: "bg-blue-600",
    delivered: "bg-green-600",
    cancelled: "bg-red-500",
  };

  return classes[key] ?? "bg-zinc-400";
}

function getStatusBarClass(key: string): string {
  const classes: Record<string, string> = {
    pending: "bg-amber-400",
    confirmed: "bg-sky-500",
    preparing: "bg-orange-500",
    packing: "bg-violet-500",
    onWay: "bg-blue-600",
    delivered: "bg-green-600",
    cancelled: "bg-red-500",
  };

  return classes[key] ?? "bg-zinc-400";
}

interface RefreshIconProps {
  spinning: boolean;
}

function RefreshIcon({
  spinning,
}: RefreshIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`}
    >
      <path
        d="M20 7v5h-5M4 17v-5h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M18.5 10A7 7 0 0 0 6 7.5L4 12M5.5 14A7 7 0 0 0 18 16.5l2-4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M15 8.75h-4.2a2.05 2.05 0 0 0 0 4.1h2.4a2.05 2.05 0 0 1 0 4.1H9M12 7v2M12 17v2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OrderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path
        d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="m4.5 7.75 7.5 4.3 7.5-4.3M12 12v8.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path
        d="M5 4.5h14v15l-2.25-1.5-2.25 1.5L12 18l-2.5 1.5L7 18l-2 1.5v-15Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M8 9h8M8 13h5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path
        d="M5 5.5h14v14H5v-14ZM8 3.5v4M16 3.5v4M5 9.5h14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path
        d="M12 20c5 0 8-3.7 8-8.5C15.2 11.3 12 14.1 12 20ZM12 20c-5 0-8-3.7-8-8.5 4.8-.2 8 2.6 8 8.5ZM12 14c0-4.5 2.2-7.5 6-9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AvailableIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path
        d="M5 12.5 9.5 17 19 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path
        d="M12 4 21 20H3L12 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M12 9v5M12 17h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CustomerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M5.5 20c.5-4 2.7-6 6.5-6s6 2 6.5 6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path
        d="M5 19V9M12 19V5M19 19v-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}