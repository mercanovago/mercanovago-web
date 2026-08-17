"use client";

import Link from "next/link";
import {
  ReactNode,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

interface CatalogLayoutProps {
  children: ReactNode;
}

interface CatalogNavigationItem {
  label: string;
  description: string;
  href: string;
  icon: ReactNode;
  exact?: boolean;
  badge?: string;
}

const navigationItems: CatalogNavigationItem[] = [
  {
    label: "Dashboard",
    description: "Estado y calidad del catálogo",
    href: "/admin/catalog",
    icon: <DashboardIcon />,
    exact: true,
  },
  {
    label: "Productos",
    description: "Gestión individual estable",
    href: "/admin/products",
    icon: <ProductsIcon />,
    badge: "Operativo",
  },
  {
    label: "Categorías",
    description: "Estructura del catálogo maestro",
    href: "/admin/catalog/settings",
    icon: <CategoriesIcon />,
    badge: "ERP",
  },
  {
    label: "Proveedores",
    description: "Abastecimiento y contactos",
    href: "/admin/catalog/suppliers",
    icon: <SuppliersIcon />,
    badge: "Nuevo",
  },
  {
    label: "Importación",
    description: "Carga masiva desde Excel",
    href: "/admin/catalog/import",
    icon: <UploadIcon />,
  },
  {
    label: "Fotografías",
    description: "Asociación masiva de imágenes",
    href: "/admin/catalog/photos",
    icon: <ImageIcon />,
  },
  {
    label: "Editor masivo",
    description: "Precios, stock y categorías",
    href: "/admin/catalog/editor",
    icon: <EditIcon />,
  },
  {
    label: "Historial",
    description: "Cambios y trazabilidad",
    href: "/admin/catalog/history",
    icon: <HistoryIcon />,
  },
  {
    label: "IA Mayorista",
    description: "Procesamiento inteligente de precios",
    href: "/admin/catalog/market-ai",
    icon: <SparkIcon />,
  },
];

function isItemActive(
  pathname: string,
  item: CatalogNavigationItem
): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return (
    pathname === item.href ||
    pathname.startsWith(
      `${item.href}/`
    )
  );
}

export default function CatalogLayout({
  children,
}: CatalogLayoutProps) {
  const pathname = usePathname();

  const [
    mobileNavigationOpen,
    setMobileNavigationOpen,
  ] = useState(false);

  useEffect(() => {
    setMobileNavigationOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavigationOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setMobileNavigationOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [mobileNavigationOpen]);

  return (
    <div className="min-h-screen bg-[#f4f7f4]">
      <section className="mx-auto max-w-[1550px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-7 text-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.8)] sm:px-8 lg:px-10">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-green-500/20 blur-3xl"
          />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm font-black text-green-300 transition hover:text-white"
              >
                <ArrowLeftIcon />
                Volver al panel
              </Link>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-green-300">
                MercaNova ERP
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Catálogo Maestro
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300 sm:text-base">
                Administra productos, categorías, proveedores,
                fotografías, precios e inteligencia comercial
                desde un único espacio de trabajo.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  setMobileNavigationOpen(
                    true
                  )
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 text-sm font-black text-white transition hover:bg-white/20 xl:hidden"
              >
                <MenuIcon />
                Herramientas
              </button>

              <Link
                href="/admin/products"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-green-500 px-6 text-sm font-black text-zinc-950 transition hover:bg-green-400"
              >
                <PlusIcon />
                Nuevo producto
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="hidden xl:block">
            <div className="sticky top-6 overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-[0_25px_70px_-50px_rgba(15,23,42,0.55)]">
              <div className="border-b border-zinc-200 px-5 py-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-600">
                  Centro de trabajo
                </p>

                <h2 className="mt-2 text-lg font-black text-zinc-950">
                  Operación comercial
                </h2>
              </div>

              <CatalogNavigation
                pathname={pathname}
              />
            </div>
          </aside>

          <main className="min-w-0">
            {children}
          </main>
        </div>
      </section>

      {mobileNavigationOpen && (
        <div className="fixed inset-0 z-[80] xl:hidden">
          <button
            type="button"
            aria-label="Cerrar herramientas del catálogo"
            onClick={() =>
              setMobileNavigationOpen(
                false
              )
            }
            className="absolute inset-0 bg-zinc-950/65 backdrop-blur-sm"
          />

          <aside className="relative flex h-full w-[min(90vw,360px)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-600">
                  MercaNova ERP
                </p>

                <h2 className="mt-1 text-lg font-black text-zinc-950">
                  Catálogo Maestro
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileNavigationOpen(
                    false
                  )
                }
                aria-label="Cerrar menú"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
              >
                <CloseIcon />
              </button>
            </div>

            <CatalogNavigation
              pathname={pathname}
            />
          </aside>
        </div>
      )}
    </div>
  );
}

function CatalogNavigation({
  pathname,
}: {
  pathname: string;
}) {
  return (
    <nav className="overflow-y-auto p-3">
      <div className="space-y-1.5">
        {navigationItems.map(
          (item) => {
            const active =
              isItemActive(
                pathname,
                item
              );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                  active
                    ? "bg-green-600 text-white shadow-lg shadow-green-900/15"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    active
                      ? "bg-white/15 text-white"
                      : "bg-zinc-100 text-zinc-600 group-hover:bg-white group-hover:text-green-700"
                  }`}
                >
                  {item.icon}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-black">
                      {item.label}
                    </span>

                    {item.badge && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                          active
                            ? "bg-white/15 text-white"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>

                  <span
                    className={`mt-0.5 block truncate text-[10px] font-semibold ${
                      active
                        ? "text-green-100"
                        : "text-zinc-400"
                    }`}
                  >
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          }
        )}
      </div>
    </nav>
  );
}

function IconShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      {children}
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <IconShell>
      <path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </IconShell>
  );
}

function MenuIcon() {
  return (
    <IconShell>
      <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </IconShell>
  );
}

function CloseIcon() {
  return (
    <IconShell>
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </IconShell>
  );
}

function PlusIcon() {
  return (
    <IconShell>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </IconShell>
  );
}

function DashboardIcon() {
  return (
    <IconShell>
      <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.7" />
      <rect x="14" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.7" />
    </IconShell>
  );
}

function ProductsIcon() {
  return (
    <IconShell>
      <path d="M4.5 7.5 12 3.5l7.5 4v9L12 20.5l-7.5-4v-9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m5 7.75 7 3.75 7-3.75M12 11.5v9" stroke="currentColor" strokeWidth="1.7" />
    </IconShell>
  );
}

function CategoriesIcon() {
  return (
    <IconShell>
      <path d="M4 5h7v6H4V5ZM13 5h7v6h-7V5ZM4 13h7v6H4v-6ZM13 13h7v6h-7v-6Z" stroke="currentColor" strokeWidth="1.7" />
    </IconShell>
  );
}

function SuppliersIcon() {
  return (
    <IconShell>
      <path d="M3.5 7h11v9h-11V7ZM14.5 10h3l3 3v3h-6v-6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="1.7" />
    </IconShell>
  );
}

function UploadIcon() {
  return (
    <IconShell>
      <path d="M12 16V5M8 9l4-4 4 4M5 14v5h14v-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconShell>
  );
}

function ImageIcon() {
  return (
    <IconShell>
      <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="9" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m6 17 4-4 3 3 2-2 3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </IconShell>
  );
}

function EditIcon() {
  return (
    <IconShell>
      <path d="m5 16-1 4 4-1L19 8l-3-3L5 16Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </IconShell>
  );
}

function HistoryIcon() {
  return (
    <IconShell>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 5v4h4M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconShell>
  );
}

function SparkIcon() {
  return (
    <IconShell>
      <path d="M12 3c.8 4.2 2.8 6.2 7 7-4.2.8-6.2 2.8-7 7-.8-4.2-2.8-6.2-7-7 4.2-.8 6.2-2.8 7-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </IconShell>
  );
}