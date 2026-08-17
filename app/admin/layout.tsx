"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import BrandLogo from "@/components/layout/BrandLogo";
import {
  adminLogout,
  getCurrentAdmin,
  subscribeToAdminAuthChanges,
} from "@/services/adminLogin";

import type {
  AdminProfile,
} from "@/services/adminLogin";

interface AdminLayoutProps {
  children: ReactNode;
}

interface AdminNavigationItem {
  label: string;
  description: string;
  href: string;
  icon: ReactNode;
  exact?: boolean;
}

const publicAdminRoutes = [
  "/admin/login",
  "/admin/recuperar-contrasena",
  "/admin/restablecer-contrasena",
];

const navigationItems: AdminNavigationItem[] = [
  {
    label: "Panel general",
    description: "Resumen administrativo",
    href: "/admin",
    icon: <DashboardIcon />,
    exact: true,
  },
  {
    label: "Centro de catálogo",
    description: "Calidad y operación comercial",
    href: "/admin/catalog",
    icon: <CatalogIcon />,
  },
  {
    label: "Productos",
    description: "Gestión individual",
    href: "/admin/products",
    icon: <ProductsIcon />,
  },
  {
    label: "Precios del mercado",
    description: "Márgenes y referencias",
    href: "/admin/market-prices",
    icon: <PriceIcon />,
  },
  {
    label: "Pedidos",
    description: "Operación de ventas",
    href: "/admin/orders",
    icon: <OrdersIcon />,
  },
  {
    label: "Delivery",
    description: "Repartidores y entregas",
    href: "/admin/delivery",
    icon: <DeliveryIcon />,
  },
  {
    label: "Clientes",
    description: "Base comercial",
    href: "/admin/customers",
    icon: <CustomersIcon />,
  },
  {
    label: "Estadísticas",
    description: "Rendimiento del negocio",
    href: "/admin/stats",
    icon: <StatsIcon />,
  },
  {
    label: "Seguridad",
    description: "Cuenta y acceso",
    href: "/admin/security",
    icon: <SecurityIcon />,
  },
];

function isPublicAdminRoute(
  pathname: string
): boolean {
  return publicAdminRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

function isNavigationItemActive(
  pathname: string,
  item: AdminNavigationItem
): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`)
  );
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [admin, setAdmin] =
    useState<AdminProfile | null>(null);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [sessionError, setSessionError] =
    useState("");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const publicRoute =
    isPublicAdminRoute(pathname);

  useEffect(() => {
    let active = true;

    async function verifyAdminSession() {
      if (publicRoute) {
        if (active) {
          setCheckingSession(false);
          setSessionError("");
        }

        return;
      }

      try {
        setCheckingSession(true);
        setSessionError("");

        const currentAdmin =
          await getCurrentAdmin();

        if (!active) {
          return;
        }

        if (!currentAdmin) {
          setAdmin(null);

          const redirectTarget =
            encodeURIComponent(pathname);

          router.replace(
            `/admin/login?redirect=${redirectTarget}`
          );

          return;
        }

        setAdmin(currentAdmin);
      } catch (error) {
        console.error(
          "Error protegiendo la ruta administrativa:",
          error
        );

        if (!active) {
          return;
        }

        setAdmin(null);

        setSessionError(
          error instanceof Error
            ? error.message
            : "No fue posible validar la sesión administrativa."
        );
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    void verifyAdminSession();

    return () => {
      active = false;
    };
  }, [
    pathname,
    publicRoute,
    router,
  ]);

  useEffect(() => {
    if (publicRoute) {
      return;
    }

    const unsubscribe =
      subscribeToAdminAuthChanges(
        (currentAdmin) => {
          if (!currentAdmin) {
            setAdmin(null);

            const redirectTarget =
              encodeURIComponent(pathname);

            router.replace(
              `/admin/login?redirect=${redirectTarget}`
            );

            return;
          }

          setAdmin(currentAdmin);
          setSessionError("");
        }
      );

    return unsubscribe;
  }, [
    pathname,
    publicRoute,
    router,
  ]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
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
  }, [mobileMenuOpen]);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);
      setSessionError("");

      await adminLogout();

      setAdmin(null);
      router.replace("/admin/login");
    } catch (error) {
      console.error(
        "Error cerrando la sesión administrativa:",
        error
      );

      setSessionError(
        error instanceof Error
          ? error.message
          : "No fue posible cerrar la sesión."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  if (publicRoute) {
    return <>{children}</>;
  }

  if (checkingSession) {
    return <AdminLoadingState />;
  }

  if (sessionError && !admin) {
    return (
      <AdminSessionError
        message={sessionError}
        onReturnToLogin={() =>
          router.replace("/admin/login")
        }
      />
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f4f7f4]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-zinc-200 bg-white lg:flex lg:flex-col">
        <AdminSidebar
          admin={admin}
          pathname={pathname}
          loggingOut={loggingOut}
          onLogout={() =>
            void handleLogout()
          }
        />
      </aside>

      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            aria-label="Abrir menú administrativo"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-950 shadow-sm transition hover:bg-zinc-50"
          >
            <MenuIcon />
          </button>

          <BrandLogo
            size="sm"
            className="justify-center"
          />

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-xs font-black text-white">
            {getAdminInitials(admin.name)}
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú administrativo"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="absolute inset-0 bg-zinc-950/65 backdrop-blur-sm"
          />

          <aside className="relative flex h-full w-[min(88vw,340px)] flex-col bg-white shadow-2xl">
            <div className="absolute right-4 top-4 z-10">
              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                aria-label="Cerrar menú"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
              >
                <CloseIcon />
              </button>
            </div>

            <AdminSidebar
              admin={admin}
              pathname={pathname}
              loggingOut={loggingOut}
              onLogout={() =>
                void handleLogout()
              }
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        {sessionError && (
          <div
            role="alert"
            className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800 sm:px-6 lg:px-10"
          >
            {sessionError}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

function AdminSidebar({
  admin,
  pathname,
  loggingOut,
  onLogout,
}: {
  admin: AdminProfile;
  pathname: string;
  loggingOut: boolean;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="border-b border-zinc-200 px-6 py-6">
        <BrandLogo
          size="md"
          showTagline
        />
      </div>

      <div className="border-b border-zinc-200 px-5 py-5">
        <div className="rounded-2xl bg-zinc-950 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-500 text-sm font-black text-zinc-950">
              {getAdminInitials(admin.name)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black">
                {admin.name}
              </p>

              <p className="mt-1 truncate text-xs text-zinc-400">
                {admin.email}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
            <span className="rounded-full bg-green-400/15 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-green-300">
              {formatAdminRole(admin.role)}
            </span>

            <span className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              En línea
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <p className="px-3 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
          Navegación
        </p>

        <div className="mt-3 space-y-1.5">
          {navigationItems.map((item) => {
            const active =
              isNavigationItemActive(
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
                  <span className="block truncate text-sm font-black">
                    {item.label}
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

                {active && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-zinc-200 p-4">
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left text-red-700 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
            <LogoutIcon />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black">
              {loggingOut
                ? "Cerrando sesión..."
                : "Cerrar sesión"}
            </span>

            <span className="mt-0.5 block text-[10px] font-semibold text-red-500">
              Finalizar acceso administrativo
            </span>
          </span>
        </button>

        <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
          MercaNova GO 10.0 RC1
        </p>
      </div>
    </>
  );
}

function AdminLoadingState() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7f4] px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-green-200/50 blur-3xl" />

        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      <section className="relative w-full max-w-md rounded-[2rem] border border-white/70 bg-white p-8 text-center shadow-[0_35px_100px_-45px_rgba(15,23,42,0.45)]">
        <BrandLogo
          size="md"
          showTagline
          className="justify-center"
        />

        <div className="mt-8">
          <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

          <h1 className="mt-6 text-xl font-black text-zinc-950">
            Verificando acceso administrativo
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Estamos validando tu sesión segura con
            Supabase Auth.
          </p>
        </div>
      </section>
    </main>
  );
}

function AdminSessionError({
  message,
  onReturnToLogin,
}: {
  message: string;
  onReturnToLogin: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7f4] px-4">
      <section className="w-full max-w-lg rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-[0_35px_100px_-45px_rgba(15,23,42,0.45)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-700">
          <AlertIcon />
        </div>

        <h1 className="mt-5 text-2xl font-black text-zinc-950">
          No fue posible validar el acceso
        </h1>

        <p className="mt-3 text-sm leading-7 text-zinc-600">
          {message}
        </p>

        <button
          type="button"
          onClick={onReturnToLogin}
          className="mt-7 w-full rounded-2xl bg-green-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-green-900/20 transition hover:bg-green-700"
        >
          Volver al inicio de sesión
        </button>
      </section>
    </main>
  );
}

function getAdminInitials(
  name: string
): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "AD";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function formatAdminRole(
  role: AdminProfile["role"]
): string {
  const labels: Record<
    AdminProfile["role"],
    string
  > = {
    super_admin: "Superadministrador",
    admin: "Administrador",
    catalog_manager: "Gestor de catálogo",
    order_manager: "Gestor de pedidos",
    support: "Soporte",
  };

  return labels[role];
}

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function CatalogIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
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

function OrdersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
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

function DeliveryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M3.5 6h11v10h-11V6ZM14.5 9h3l3 3v4h-6V9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle
        cx="7"
        cy="18"
        r="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="17"
        cy="18"
        r="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <circle
        cx="9"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.5 19a5.5 5.5 0 0 1 11 0M16 8.5a2.5 2.5 0 0 1 0 5M17 15.5a4 4 0 0 1 3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M5 19V9M12 19V5M19 19v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M12 3.5 5 6v5.5c0 4.2 2.8 7.8 7 9 4.2-1.2 7-4.8 7-9V6l-7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M5 7h14M5 12h14M5 17h14"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
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
      className="h-7 w-7"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 8v5M12 17h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}