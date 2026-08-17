"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import BrandLogo from "@/components/layout/BrandLogo";
import {
  adminLogin,
  getCurrentAdmin,
} from "@/services/adminLogin";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState(
    "mercanovago@gmail.com"
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] =
    useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let active = true;

    async function verifyCurrentSession() {
      try {
        const currentAdmin =
          await getCurrentAdmin();

        if (!active || !currentAdmin) {
          return;
        }

        localStorage.setItem(
          "mercanova_admin",
          JSON.stringify({
            id: currentAdmin.id,
            name: currentAdmin.name,
            email: currentAdmin.email,
            role: currentAdmin.role,
            active: currentAdmin.active,
          })
        );

        router.replace("/admin");
      } catch (error) {
        console.error(
          "Error verificando la sesión administrativa:",
          error
        );
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    verifyCurrentSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");

      const admin = await adminLogin({
        email,
        password,
      });

      localStorage.setItem(
        "mercanova_admin",
        JSON.stringify({
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          active: admin.active,
        })
      );

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      console.error(
        "Error en el ingreso administrativo:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7f4] px-4">
        <div className="text-center">
          <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

          <p className="mt-5 font-black text-zinc-700">
            Verificando sesión administrativa...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7f4] px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-green-200/50 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />

        <svg
          viewBox="0 0 1200 700"
          fill="none"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full opacity-[0.04]"
        >
          <path
            d="M0 590C180 480 340 620 520 480C700 340 830 470 980 300C1070 200 1140 205 1200 235"
            stroke="#166534"
            strokeWidth="2"
          />

          <path
            d="M0 420C180 320 350 460 540 320C720 190 840 310 1000 155C1080 78 1145 95 1200 125"
            stroke="#166534"
            strokeWidth="2"
          />
        </svg>
      </div>

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_40px_120px_-45px_rgba(15,23,42,0.45)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-zinc-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-green-500/20 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl"
          />

          <div className="relative">
            <BrandLogo
              size="lg"
              theme="dark"
              showTagline
            />

            <div className="mt-14">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-green-300">
                Acceso protegido
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight">
                Administración segura de MercaNova GO
              </h1>

              <p className="mt-5 text-base leading-8 text-zinc-300">
                Gestiona productos, pedidos, clientes,
                precios, seguridad y operaciones desde
                una sesión autenticada mediante Supabase.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-500/15 text-green-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M7 10V7a5 5 0 0 1 10 0v3M5.5 10h13v10h-13V10Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <div>
                  <p className="font-black">
                    Contraseña protegida
                  </p>

                  <p className="mt-1 text-sm leading-6 text-zinc-400">
                    Las credenciales ya no se almacenan ni
                    se comparan dentro del código.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-500/15 text-green-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />

                    <path
                      d="M8 12.25 10.75 15 16 9.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <div>
                  <p className="font-black">
                    Perfil administrativo validado
                  </p>

                  <p className="mt-1 text-sm leading-6 text-zinc-400">
                    Solo las cuentas activas registradas
                    en MercaNova GO pueden ingresar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative mt-12 text-xs font-semibold text-zinc-500">
            Panel administrativo · Uso exclusivo del
            personal autorizado
          </p>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="lg:hidden">
            <BrandLogo
              size="md"
              showTagline
            />
          </div>

          <div className="mt-8 lg:mt-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Panel administrativo
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
              Bienvenido nuevamente
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-7 text-zinc-500 sm:text-base">
              Ingresa con el correo oficial y la
              contraseña administrada de forma segura en
              Supabase Auth.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="admin-email"
                className="text-sm font-black text-zinc-950"
              >
                Correo administrativo
              </label>

              <div className="mt-2 flex overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 transition focus-within:border-green-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-100">
                <span className="flex items-center px-4 text-zinc-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M4.25 6.25h15.5v11.5H4.25V6.25Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />

                    <path
                      d="m5 7 7 5.25L19 7"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="correo@mercanovago.com"
                  className="min-w-0 flex-1 bg-transparent px-1 py-4 pr-4 font-semibold text-zinc-950 outline-none placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="admin-password"
                  className="text-sm font-black text-zinc-950"
                >
                  Contraseña
                </label>

                <Link
                  href="/admin/recuperar-contrasena"
                  className="text-xs font-black text-green-700 transition hover:text-green-800"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <div className="mt-2 flex overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 transition focus-within:border-green-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-100">
                <span className="flex items-center px-4 text-zinc-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M7 10V7a5 5 0 0 1 10 0v3M5.5 10h13v10h-13V10Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <input
                  id="admin-password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="Ingresa tu contraseña"
                  className="min-w-0 flex-1 bg-transparent px-1 py-4 font-semibold text-zinc-950 outline-none placeholder:text-zinc-400"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  className="flex w-12 shrink-0 items-center justify-center text-zinc-400 transition hover:text-green-700"
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <path
                        d="m4 4 16 16M10.75 10.75a1.75 1.75 0 0 0 2.5 2.5M9.9 5.9A9.6 9.6 0 0 1 12 5.65c5.35 0 8.25 6.35 8.25 6.35a14.3 14.3 0 0 1-2.55 3.45M6.45 6.45C4.7 7.72 3.75 9.52 3.75 12c0 0 2.9 6.35 8.25 6.35 1.25 0 2.37-.35 3.35-.9"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <path
                        d="M3.75 12S6.65 5.65 12 5.65 20.25 12 20.25 12 17.35 18.35 12 18.35 3.75 12 3.75 12Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="2.75"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-5 w-5"
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
                </span>

                <div>
                  <p className="font-black text-red-900">
                    No fue posible iniciar sesión
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-800">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 px-6 py-4 text-base font-black text-white shadow-lg shadow-green-900/20 transition hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verificando acceso...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M14 7.25 18.75 12 14 16.75M18.5 12H8M10 4.75H5.25v14.5H10"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  Ingresar al panel
                </>
              )}
            </button>
          </form>

          <div className="mt-7 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="h-5 w-5"
                >
                  <path
                    d="M12 3.75 19 6.5v5.25c0 4.45-2.85 7.5-7 8.5-4.15-1-7-4.05-7-8.5V6.5l7-2.75Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="m9 12 2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <div>
                <p className="text-sm font-black text-zinc-950">
                  Acceso exclusivo
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Solo las cuentas administrativas
                  activas y autorizadas pueden acceder a
                  esta plataforma.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="mt-6 flex items-center justify-center gap-2 text-sm font-black text-zinc-500 transition hover:text-green-700"
          >
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

            Volver a MercaNova GO
          </Link>
        </div>
      </section>
    </main>
  );
}