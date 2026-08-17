"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import AdminGuard from "@/components/admin/AdminGuard";

import {
  getAdminDashboardMetrics,
} from "@/services/adminDashboard";

import type {
  AdminDashboardMetrics,
} from "@/services/adminDashboard";

interface AdminModule {
  title: string;
  description: string;
  href: string;
  accent: string;
  icon: React.ReactNode;
  featured?: boolean;
}

const EMPTY_METRICS: AdminDashboardMetrics = {
  salesToday: 0,
  ordersToday: 0,
  newCustomersToday: 0,
  activeProducts: 0,
  outOfStockProducts: 0,
  pendingOrders: 0,
  deliveredOrdersToday: 0,
  averageTicketToday: 0,
  salesVariationPercent: null,
  ordersVariationPercent: null,
  updatedAt: "",
};

function formatMoney(
  value: number
): string {
  return new Intl.NumberFormat(
    "es-EC",
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }
  ).format(value);
}

function formatUpdatedAt(
  value: string
): string {
  if (!value) {
    return "Sin actualizar";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Sin actualizar";
  }

  return new Intl.DateTimeFormat(
    "es-EC",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function getVariationLabel(
  value: number | null
): string {
  if (value === null) {
    return "Sin base previa";
  }

  if (value === 0) {
    return "Sin variación";
  }

  const prefix =
    value > 0 ? "+" : "";

  return `${prefix}${value}% vs. ayer`;
}

export default function AdminPage() {
  const [
    metrics,
    setMetrics,
  ] =
    useState<AdminDashboardMetrics>(
      EMPTY_METRICS
    );

  const [
    loadingMetrics,
    setLoadingMetrics,
  ] = useState(true);

  const [
    refreshingMetrics,
    setRefreshingMetrics,
  ] = useState(false);

  const [
    metricsError,
    setMetricsError,
  ] = useState("");

  const modules: AdminModule[] = [
    {
      title: "Centro de catálogo",
      description:
        "Supervisar calidad, disponibilidad y preparación comercial del catálogo.",
      href: "/admin/catalog",
      accent:
        "from-green-500 to-emerald-600",
      icon: <CatalogIcon />,
      featured: true,
    },
    {
      title: "Pedidos",
      description:
        "Administrar pedidos, estados comerciales y coordinación logística.",
      href: "/admin/orders",
      accent:
        "from-emerald-500 to-teal-600",
      icon: <OrdersIcon />,
    },
    {
      title: "Productos",
      description:
        "Crear, editar y administrar productos individuales.",
      href: "/admin/products",
      accent:
        "from-lime-500 to-green-600",
      icon: <ProductsIcon />,
    },
    {
      title: "Delivery",
      description:
        "Gestionar repartidores, asignaciones y operación de entregas.",
      href: "/admin/delivery",
      accent:
        "from-cyan-500 to-sky-600",
      icon: <DeliveryIcon />,
    },
    {
      title: "Clientes",
      description:
        "Consultar y administrar los clientes registrados.",
      href: "/admin/customers",
      accent:
        "from-blue-500 to-indigo-600",
      icon: <CustomersIcon />,
    },
    {
      title: "Estadísticas",
      description:
        "Visualizar ventas, pedidos y rendimiento de la operación.",
      href: "/admin/stats",
      accent:
        "from-violet-500 to-fuchsia-600",
      icon: <StatsIcon />,
    },
    {
      title: "Precios del mercado",
      description:
        "Administrar precios, márgenes y referencias mayoristas.",
      href: "/admin/market-prices",
      accent:
        "from-amber-500 to-orange-600",
      icon: <PriceIcon />,
    },
    {
      title: "Seguridad",
      description:
        "Administrar contraseña, sesión y controles de acceso.",
      href: "/admin/security",
      accent:
        "from-red-500 to-rose-600",
      icon: <SecurityIcon />,
    },
  ];

  const loadMetrics =
    useCallback(
      async (
        manualRefresh = false
      ) => {
        try {
          if (manualRefresh) {
            setRefreshingMetrics(true);
          } else {
            setLoadingMetrics(true);
          }

          setMetricsError("");

          const dashboardMetrics =
            await getAdminDashboardMetrics();

          setMetrics(
            dashboardMetrics
          );
        } catch (error) {
          console.error(
            "Error cargando el dashboard ejecutivo:",
            error
          );

          setMetricsError(
            error instanceof Error
              ? error.message
              : "No fue posible cargar los indicadores."
          );
        } finally {
          setLoadingMetrics(false);
          setRefreshingMetrics(false);
        }
      },
      []
    );

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#f4f7f4]">
        <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <header className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-9 text-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.8)] sm:px-10 lg:px-12 lg:py-12">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-green-500/20 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl"
            />

            <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-green-300">
                  MercaNova GO
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  Dashboard Ejecutivo
                </h1>

                <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
                  Visión consolidada de ventas, pedidos,
                  clientes, catálogo y operación diaria.
                </p>

                <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-green-400/20 bg-green-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-green-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_18px_rgba(74,222,128,0.85)]" />
                  Sistema operativo
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                    Última actualización
                  </p>

                  <p className="mt-1 text-sm font-black text-white">
                    {formatUpdatedAt(
                      metrics.updatedAt
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    loadMetrics(true)
                  }
                  disabled={
                    refreshingMetrics
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 text-sm font-black text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshIcon
                    spinning={
                      refreshingMetrics
                    }
                  />

                  {refreshingMetrics
                    ? "Actualizando..."
                    : "Actualizar datos"}
                </button>
              </div>
            </div>
          </header>

          <section className="mt-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
                  Rendimiento de hoy
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
                  Indicadores principales
                </h2>
              </div>

              <Link
                href="/admin/stats"
                className="inline-flex items-center gap-2 text-sm font-black text-green-700 transition hover:text-green-800"
              >
                Ver estadísticas completas
                <ArrowRightIcon />
              </Link>
            </div>

            {metricsError && (
              <div
                role="alert"
                className="mt-5 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-black text-red-900">
                    No fue posible cargar todos los indicadores
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    {metricsError}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    loadMetrics(true)
                  }
                  className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-black text-white"
                >
                  Reintentar
                </button>
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Ventas de hoy"
                value={formatMoney(
                  metrics.salesToday
                )}
                detail={getVariationLabel(
                  metrics.salesVariationPercent
                )}
                loading={loadingMetrics}
                href="/admin/orders"
                icon={<SalesMetricIcon />}
              />

              <MetricCard
                label="Pedidos de hoy"
                value={String(
                  metrics.ordersToday
                )}
                detail={getVariationLabel(
                  metrics.ordersVariationPercent
                )}
                loading={loadingMetrics}
                href="/admin/orders"
                icon={<OrdersMetricIcon />}
              />

              <MetricCard
                label="Ticket promedio"
                value={formatMoney(
                  metrics.averageTicketToday
                )}
                detail="Promedio por pedido válido"
                loading={loadingMetrics}
                href="/admin/stats"
                icon={<TicketMetricIcon />}
              />

              <MetricCard
                label="Clientes nuevos"
                value={String(
                  metrics.newCustomersToday
                )}
                detail="Registrados durante hoy"
                loading={loadingMetrics}
                href="/admin/customers"
                icon={<CustomersMetricIcon />}
              />

              <MetricCard
                label="Pedidos pendientes"
                value={String(
                  metrics.pendingOrders
                )}
                detail="Requieren atención"
                loading={loadingMetrics}
                href="/admin/orders"
                icon={<PendingMetricIcon />}
                alert={
                  metrics.pendingOrders > 0
                }
              />

              <MetricCard
                label="Entregados hoy"
                value={String(
                  metrics.deliveredOrdersToday
                )}
                detail="Pedidos completados"
                loading={loadingMetrics}
                href="/admin/delivery"
                icon={<DeliveredMetricIcon />}
              />

              <MetricCard
                label="Productos disponibles"
                value={String(
                  metrics.activeProducts
                )}
                detail="Con disponibilidad activa"
                loading={loadingMetrics}
                href="/admin/products"
                icon={<ProductsMetricIcon />}
              />

              <MetricCard
                label="Productos agotados"
                value={String(
                  metrics.outOfStockProducts
                )}
                detail={
                  metrics.outOfStockProducts >
                  0
                    ? "Requieren revisión"
                    : "Catálogo abastecido"
                }
                loading={loadingMetrics}
                href="/admin/products"
                icon={<StockMetricIcon />}
                alert={
                  metrics.outOfStockProducts >
                  0
                }
              />
            </div>
          </section>

          <section className="mt-9">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
                Gestión empresarial
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
                Módulos administrativos
              </h2>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {modules.map((module) => (
                <Link
                  key={module.href}
                  href={module.href}
                  className={`group relative overflow-hidden rounded-[1.75rem] border bg-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.65)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-45px_rgba(15,23,42,0.7)] ${
                    module.featured
                      ? "border-green-300 ring-4 ring-green-100"
                      : "border-zinc-200"
                  }`}
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${module.accent}`}
                  />

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-zinc-950 text-white transition group-hover:bg-green-600">
                        {module.icon}
                      </span>

                      {module.featured && (
                        <span className="rounded-full bg-green-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-green-700">
                          Centro principal
                        </span>
                      )}
                    </div>

                    <h3 className="mt-6 text-2xl font-black text-zinc-950">
                      {module.title}
                    </h3>

                    <p className="mt-3 min-h-[60px] text-sm leading-6 text-zinc-500">
                      {module.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-sm font-black text-green-600">
                      Ingresar
                      <ArrowRightIcon />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-7 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.55)] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
                  Infraestructura
                </p>

                <h2 className="mt-2 text-2xl font-black text-zinc-950">
                  Estado del sistema
                </h2>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-600" />
                En línea
              </span>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SystemStatusCard
                label="Plataforma"
                value="Operativa"
              />

              <SystemStatusCard
                label="Base de datos"
                value="Supabase"
              />

              <SystemStatusCard
                label="Framework"
                value="Next.js 16"
              />

              <SystemStatusCard
                label="Versión"
                value="MercaNova GO 11.0"
              />
            </div>
          </section>

          <footer className="mt-10 text-center text-sm font-medium text-zinc-500">
            © 2026 MercaNova GO · Dashboard Ejecutivo
            Premium
          </footer>
        </section>
      </main>
    </AdminGuard>
  );
}

function MetricCard({
  label,
  value,
  detail,
  loading,
  href,
  icon,
  alert = false,
}: {
  label: string;
  value: string;
  detail: string;
  loading: boolean;
  href: string;
  icon: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-[1.6rem] border bg-white p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.6)] transition hover:-translate-y-0.5 ${
        alert
          ? "border-amber-200"
          : "border-zinc-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            alert
              ? "bg-amber-100 text-amber-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {icon}
        </span>

        <ArrowRightIcon />
      </div>

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>

      {loading ? (
        <span className="mt-3 block h-9 w-28 animate-pulse rounded-xl bg-zinc-200" />
      ) : (
        <p className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
          {value}
        </p>
      )}

      <p
        className={`mt-2 text-xs font-bold ${
          alert
            ? "text-amber-700"
            : "text-zinc-500"
        }`}
      >
        {detail}
      </p>
    </Link>
  );
}

function SystemStatusCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl bg-zinc-50 p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>

      <p className="mt-3 text-xl font-black text-zinc-950">
        {value}
      </p>
    </article>
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
      aria-hidden="true"
      className={`h-4 w-4 ${
        spinning
          ? "animate-spin"
          : ""
      }`}
    >
      <path
        d="M20 7v5h-5M4 17v-5h5M6.1 8.2A7 7 0 0 1 18.5 6M17.9 15.8A7 7 0 0 1 5.5 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4 transition-transform group-hover:translate-x-1"
    >
      <path
        d="M5 12h14M14 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SalesMetricIcon() {
  return <PriceIcon />;
}

function OrdersMetricIcon() {
  return <OrdersIcon />;
}

function TicketMetricIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M5 4h14v16H5V4Zm4 4h6M9 12h6M9 16h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CustomersMetricIcon() {
  return <CustomersIcon />;
}

function PendingMetricIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function DeliveredMetricIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProductsMetricIcon() {
  return <ProductsIcon />;
}

function StockMetricIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4.5 7.5 12 3.5l7.5 4v9L12 20.5l-7.5-4v-9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8.5 12h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CatalogIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path
        d="M4 5h16v14H4V5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 5v14M4 10h16M4 15h16"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path
        d="M6 3.5h12v17H6v-17Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9 8h6M9 12h6M9 16h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path
        d="M4.5 7.5 12 3.5l7.5 4v9L12 20.5l-7.5-4v-9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m5 7.75 7 3.75 7-3.75M12 11.5v9"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function DeliveryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path
        d="M3.5 6h11v10h-11V6ZM14.5 9h3l3 3v4h-6V9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 8.5a2.5 2.5 0 0 1 0 5M17 15.5a4 4 0 0 1 3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path d="M5 19V9M12 19V5M19 19v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PriceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path d="M12 3v18M16.5 7.5c0-1.4-1.7-2.5-4.5-2.5S7.5 6.1 7.5 7.5 9 10 12 10s4.5 1.1 4.5 2.5S14.8 15 12 15s-4.5-1.1-4.5-2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <path d="M12 3.5 5 6v5.5c0 4.2 2.8 7.8 7 9 4.2-1.2 7-4.8 7-9V6l-7-2.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}