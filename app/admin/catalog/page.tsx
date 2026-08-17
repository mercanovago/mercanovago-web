"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import AdminGuard from "@/components/admin/AdminGuard";
import {
  getCatalogDashboardData,
  type CatalogDashboardData,
  type CatalogMetric,
} from "@/services/catalogDashboard";

const metricStyles: Record<
  CatalogMetric["key"],
  {
    container: string;
    icon: string;
  }
> = {
  total: {
    container:
      "border-zinc-200 bg-white",
    icon: "bg-zinc-950 text-white",
  },
  available: {
    container:
      "border-green-200 bg-green-50/60",
    icon: "bg-green-600 text-white",
  },
  out_of_stock: {
    container:
      "border-red-200 bg-red-50/60",
    icon: "bg-red-600 text-white",
  },
  featured: {
    container:
      "border-amber-200 bg-amber-50/60",
    icon: "bg-amber-500 text-white",
  },
  offers: {
    container:
      "border-violet-200 bg-violet-50/60",
    icon: "bg-violet-600 text-white",
  },
  without_image: {
    container:
      "border-sky-200 bg-sky-50/60",
    icon: "bg-sky-600 text-white",
  },
  without_description: {
    container:
      "border-orange-200 bg-orange-50/60",
    icon: "bg-orange-600 text-white",
  },
};

export default function AdminCatalogPage() {
  const [dashboard, setDashboard] =
    useState<CatalogDashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadDashboard = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        const data =
          await getCatalogDashboardData();

        setDashboard(data);
      } catch (error) {
        console.error(
          "Error cargando el Centro de Gestión del Catálogo:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No fue posible cargar la información del catálogo."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#f4f7f4]">
        <section className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <header className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-8 text-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.8)] sm:px-9 lg:px-12 lg:py-12">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-green-500/20 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl"
            />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 text-sm font-black text-green-300 transition hover:text-white"
                >
                  <ArrowLeftIcon />
                  Volver al panel
                </Link>

                <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-green-300">
                  Operación comercial
                </p>

                <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  Centro de Gestión del Catálogo
                </h1>

                <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300 sm:text-lg">
                  Supervisa la calidad, disponibilidad y
                  preparación comercial de todos los productos
                  de MercaNova GO desde un único centro de
                  control.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    void loadDashboard(true)
                  }
                  disabled={refreshing}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 text-sm font-black text-white transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60"
                >
                  <RefreshIcon spinning={refreshing} />
                  {refreshing
                    ? "Actualizando..."
                    : "Actualizar datos"}
                </button>

                <Link
                  href="/admin/catalog/intelligence"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-green-500 px-6 text-sm font-black text-zinc-950 transition hover:bg-green-400"
                >
                  <SparkIcon />
                  Inteligencia IA
                </Link>
              </div>
            </div>
          </header>

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-bold text-red-800"
            >
              {errorMessage}
            </div>
          )}

          {loading ? (
            <CatalogLoadingState />
          ) : dashboard ? (
            <>
              <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {dashboard.metrics.map(
                  (metric) => (
                    <MetricCard
                      key={metric.key}
                      metric={metric}
                    />
                  )
                )}
              </section>

              <section className="mt-7 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <CatalogCompletionCard
                  percentage={
                    dashboard.catalogCompletion
                  }
                  lastUpdate={
                    dashboard.lastUpdate
                  }
                />

                <CatalogQualityCard
                  indicators={
                    dashboard.qualityIndicators
                  }
                />
              </section>

              <QuickActions />

              <section className="mt-7 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <AttentionProductsCard
                  items={dashboard.attentionItems}
                />

                <RecentActivityCard
                  activities={
                    dashboard.recentActivity
                  }
                />
              </section>
            </>
          ) : null}
        </section>
      </main>
    </AdminGuard>
  );
}

function MetricCard({
  metric,
}: {
  metric: CatalogMetric;
}) {
  const styles = metricStyles[metric.key];

  return (
    <article
      className={`rounded-[1.5rem] border p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.55)] ${styles.container}`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${styles.icon}`}
      >
        <MetricIcon type={metric.key} />
      </span>

      <p className="mt-5 text-3xl font-black tracking-tight text-zinc-950">
        {metric.value.toLocaleString("es-EC")}
      </p>

      <p className="mt-1 text-sm font-black text-zinc-800">
        {metric.label}
      </p>

      <p className="mt-2 text-xs leading-5 text-zinc-500">
        {metric.description}
      </p>
    </article>
  );
}

function CatalogCompletionCard({
  percentage,
  lastUpdate,
}: {
  percentage: number;
  lastUpdate: string | null;
}) {
  const circumference = 2 * Math.PI * 54;
  const offset =
    circumference -
    (percentage / 100) * circumference;

  return (
    <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.55)] sm:p-8">
      <div className="flex flex-col items-center gap-7 sm:flex-row">
        <div className="relative h-40 w-40 shrink-0">
          <svg
            viewBox="0 0 128 128"
            className="h-full w-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="64"
              cy="64"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-zinc-100"
            />

            <circle
              cx="64"
              cy="64"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="text-green-600 transition-all duration-700"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-zinc-950">
              {percentage}%
            </span>

            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Completo
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
            Estado general
          </p>

          <h2 className="mt-2 text-2xl font-black text-zinc-950">
            Preparación del catálogo
          </h2>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Este indicador combina fotografías,
            descripciones, disponibilidad e información
            comercial de todos los productos registrados.
          </p>

          <p className="mt-5 text-xs font-bold text-zinc-400">
            Último registro identificado:{" "}
            <span className="text-zinc-700">
              {formatDate(lastUpdate)}
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}

function CatalogQualityCard({
  indicators,
}: {
  indicators: CatalogDashboardData["qualityIndicators"];
}) {
  return (
    <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.55)] sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
        Calidad del catálogo
      </p>

      <h2 className="mt-2 text-2xl font-black text-zinc-950">
        Nivel de cumplimiento
      </h2>

      <div className="mt-7 space-y-6">
        {indicators.map((indicator) => (
          <div key={indicator.key}>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-black text-zinc-700">
                {indicator.label}
              </span>

              <span className="text-sm font-black text-zinc-950">
                {indicator.percentage}%
              </span>
            </div>

            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-green-600 transition-all duration-700"
                style={{
                  width: `${indicator.percentage}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs font-semibold text-zinc-400">
              {indicator.completed.toLocaleString(
                "es-EC"
              )}{" "}
              de{" "}
              {indicator.total.toLocaleString(
                "es-EC"
              )}{" "}
              productos
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function QuickActions() {
  const actions = [
    {
      title: "Inteligencia IA",
      description:
        "Contenido comercial, nutrición, conservación, Chef, búsqueda y SEO.",
      href: "/admin/catalog/intelligence",
      icon: <SparkIcon />,
      enabled: true,
    },
    {
      title: "Importación masiva",
      description:
        "Incorpora y valida productos desde archivos de catálogo.",
      href: "/admin/catalog/import",
      icon: <UploadIcon />,
      enabled: true,
    },
    {
      title: "Fotografías",
      description:
        "Gestiona imágenes, galería, principal y Storage del catálogo.",
      href: "/admin/catalog/photos",
      icon: <ImageIcon />,
      enabled: true,
    },
    {
      title: "Editor masivo",
      description:
        "Administra cambios comerciales y operativos del catálogo.",
      href: "/admin/catalog/editor",
      icon: <EditIcon />,
      enabled: true,
    },
    {
      title: "Proveedores",
      description:
        "Gestiona proveedores y relaciones de abastecimiento.",
      href: "/admin/catalog/suppliers",
      icon: <ProductsIcon />,
      enabled: true,
    },
    {
      title: "IA Mayorista",
      description:
        "Procesa información del mercado y prepara actualización inteligente.",
      href: "/admin/catalog/market-ai",
      icon: <SparkIcon />,
      enabled: true,
    },
    {
      title: "Actualizar precios",
      description:
        "Control central de precios comerciales y referencias del mercado.",
      href: "/admin/market-prices",
      icon: <PriceIcon />,
      enabled: true,
    },
    {
      title: "Historial",
      description:
        "Consulta trazabilidad y cambios realizados sobre el catálogo.",
      href: "/admin/catalog/history",
      icon: <DocumentIcon />,
      enabled: true,
    },
    {
      title: "Configuración",
      description:
        "Administra categorías y parámetros generales del catálogo.",
      href: "/admin/catalog/settings",
      icon: <EditIcon />,
      enabled: true,
    },
  ];

  return (
    <section className="mt-7 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.55)] sm:p-8">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
          Acciones rápidas
        </p>

        <h2 className="mt-2 text-2xl font-black text-zinc-950">
          Herramientas del catálogo
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
          Accede a los módulos activos del ecosistema de catálogo de MercaNova GO.
        </p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition hover:-translate-y-1 hover:border-green-300 hover:bg-green-50"
          >
            <ActionCardContent action={action} />
          </Link>
        ))}
      </div>
    </section>
  );
}

function ActionCardContent({
  action,
}: {
  action: {
    title: string;
    description: string;
    icon: React.ReactNode;
    enabled: boolean;
  };
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white">
        {action.icon}
      </span>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-black text-zinc-950">
            {action.title}
          </h3>

          {!action.enabled && (
            <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-600">
              Próximamente
            </span>
          )}
        </div>

        <p className="mt-2 text-xs leading-5 text-zinc-500">
          {action.description}
        </p>
      </div>
    </div>
  );
}

function AttentionProductsCard({
  items,
}: {
  items: CatalogDashboardData["attentionItems"];
}) {
  return (
    <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.55)] sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
            Prioridades
          </p>

          <h2 className="mt-2 text-2xl font-black text-zinc-950">
            Productos que necesitan atención
          </h2>
        </div>

        <Link
          href="/admin/catalog/editor"
          className="text-sm font-black text-green-600 transition hover:text-green-700"
        >
          Abrir editor
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
          <p className="font-black text-green-800">
            No existen alertas pendientes
          </p>

          <p className="mt-2 text-sm text-green-700">
            Todos los productos cumplen los criterios
            principales de calidad.
          </p>
        </div>
      ) : (
        <div className="mt-7 space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/producto/${encodeURIComponent(
                item.slug
              )}`}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 p-4 transition hover:border-green-300 hover:bg-green-50"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-400">
                    <ImageIcon />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-black text-zinc-950">
                  {item.name}
                </p>

                <p className="mt-1 truncate text-xs font-semibold text-zinc-400">
                  {item.category || "Sin categoría"}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {item.issues.map((issue) => (
                    <span
                      key={issue}
                      className="rounded-full bg-orange-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-orange-700"
                    >
                      {issue}
                    </span>
                  ))}
                </div>
              </div>

              <ChevronRightIcon />
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}

function RecentActivityCard({
  activities,
}: {
  activities: CatalogDashboardData["recentActivity"];
}) {
  return (
    <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.55)] sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
        Actividad reciente
      </p>

      <h2 className="mt-2 text-2xl font-black text-zinc-950">
        Últimos registros
      </h2>

      {activities.length === 0 ? (
        <div className="mt-7 rounded-2xl bg-zinc-50 p-6 text-center">
          <p className="font-black text-zinc-700">
            Sin actividad registrada
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            Los nuevos productos aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="mt-7 space-y-5">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-4"
            >
              <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <ProductsIcon />
              </span>

              <div className="min-w-0">
                <p className="truncate font-black text-zinc-900">
                  {activity.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  {activity.description}
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {formatDate(activity.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function CatalogLoadingState() {
  return (
    <div className="mt-7 space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-[1.5rem] bg-white"
            />
          )
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-[2rem] bg-white" />
        <div className="h-72 animate-pulse rounded-[2rem] bg-white" />
      </div>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Sin fecha disponible";
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "Sin fecha disponible";
  }

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  }).format(date);
}

function MetricIcon({
  type,
}: {
  type: CatalogMetric["key"];
}) {
  switch (type) {
    case "available":
      return <CheckIcon />;
    case "out_of_stock":
      return <AlertIcon />;
    case "featured":
      return <StarIcon />;
    case "offers":
      return <TagIcon />;
    case "without_image":
      return <ImageIcon />;
    case "without_description":
      return <DocumentIcon />;
    default:
      return <ProductsIcon />;
  }
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="m15 6-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon({
  spinning = false,
}: {
  spinning?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`h-4 w-4 ${
        spinning ? "animate-spin" : ""
      }`}
    >
      <path
        d="M20 11a8 8 0 1 0-2.35 5.65M20 5v6h-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.9"
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
      className="h-5 w-5"
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
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="m5 12 4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M12 4 3.5 19h17L12 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v4M12 16.5h.01"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M4 4h7l9 9-7 7-9-9V4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle
        cx="8"
        cy="8"
        r="1"
        fill="currentColor"
      />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="9"
        cy="10"
        r="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m6 17 4-4 3 3 2-2 3 3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M6 3.5h8l4 4v13H6v-17Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14 3.5v4h4M9 12h6M9 16h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M12 16V5M8 9l4-4 4 4M5 14v5h14v-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="m5 16-1 4 4-1L19 8l-3-3L5 16Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PriceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M12 3v18M16.5 7.5c0-1.4-1.7-2.5-4.5-2.5S7.5 6.1 7.5 7.5 9 10 12 10s4.5 1.1 4.5 2.5S14.8 15 12 15s-4.5-1.1-4.5-2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M12 3c.8 4.2 2.8 6.2 7 7-4.2.8-6.2 2.8-7 7-.8-4.2-2.8-6.2-7-7 4.2-.8 6.2-2.8 7-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-zinc-400"
    >
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}