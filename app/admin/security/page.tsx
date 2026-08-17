"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import AdminGuard from "@/components/admin/AdminGuard";

import {
  adminLogout,
  getCurrentAdmin,
} from "@/services/adminLogin";

import {
  evaluatePasswordStrength,
  updateAdminPassword,
} from "@/services/updateAdminPassword";

import type {
  AdminProfile,
  AdminRole,
} from "@/services/adminLogin";

function getRoleLabel(
  role: AdminRole
): string {
  const labels: Record<AdminRole, string> = {
    super_admin: "Superadministrador",
    admin: "Administrador",
    catalog_manager:
      "Gestor de catálogo",
    order_manager:
      "Gestor de pedidos",
    support: "Soporte",
  };

  return labels[role];
}

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "Sin registro";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Sin registro";
  }

  return new Intl.DateTimeFormat(
    "es-EC",
    {
      dateStyle: "long",
      timeStyle: "short",
    }
  ).format(date);
}

export default function AdminSecurityPage() {
  const router = useRouter();

  const [admin, setAdmin] =
    useState<AdminProfile | null>(null);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [repeatPassword, setRepeatPassword] =
    useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showRepeatPassword,
    setShowRepeatPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const passwordStrength = useMemo(
    () =>
      evaluatePasswordStrength(
        newPassword
      ),
    [newPassword]
  );

  const passwordsMatch =
    repeatPassword.length > 0 &&
    newPassword === repeatPassword;

  useEffect(() => {
    let active = true;

    async function loadAdmin() {
      try {
        setCheckingSession(true);
        setErrorMessage("");

        const currentAdmin =
          await getCurrentAdmin();

        if (!active) {
          return;
        }

        if (!currentAdmin) {
          router.replace(
            "/admin/login?redirect=%2Fadmin%2Fsecurity"
          );

          return;
        }

        setAdmin(currentAdmin);
      } catch (error) {
        console.error(
          "Error cargando la información de seguridad:",
          error
        );

        if (active) {
          setErrorMessage(
            "No fue posible cargar la información administrativa."
          );
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    loadAdmin();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleChangePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!admin) {
      setErrorMessage(
        "No se encontró una sesión administrativa válida."
      );
      return;
    }

    if (
      !currentPassword ||
      !newPassword ||
      !repeatPassword
    ) {
      setErrorMessage(
        "Completa los tres campos de contraseña."
      );
      return;
    }

    if (!passwordStrength.valid) {
      setErrorMessage(
        "La nueva contraseña todavía no cumple todos los requisitos de seguridad."
      );
      return;
    }

    if (
      newPassword !== repeatPassword
    ) {
      setErrorMessage(
        "Las contraseñas nuevas no coinciden."
      );
      return;
    }

    if (
      currentPassword === newPassword
    ) {
      setErrorMessage(
        "La nueva contraseña debe ser diferente de la contraseña actual."
      );
      return;
    }

    try {
      setLoading(true);

      await updateAdminPassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");

      setSuccessMessage(
        "La contraseña fue actualizada y todas las sesiones administrativas se cerraron correctamente."
      );

      window.setTimeout(() => {
        router.replace(
          "/admin/login?passwordChanged=true"
        );

        router.refresh();
      }, 1800);
    } catch (error) {
      console.error(
        "Error cambiando la contraseña:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cambiar la contraseña."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (loggingOut || loading) {
      return;
    }

    try {
      setLoggingOut(true);
      setErrorMessage("");

      await adminLogout();

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Error cerrando la sesión:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible cerrar la sesión."
      );

      setLoggingOut(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7f4] px-4">
        <div className="text-center">
          <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

          <p className="mt-5 font-black text-zinc-700">
            Verificando seguridad administrativa...
          </p>
        </div>
      </main>
    );
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#f4f7f4] px-4 py-8 text-zinc-950 sm:px-6 sm:py-12">
        <section className="mx-auto max-w-6xl">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-black text-zinc-600 shadow-sm transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
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

            Volver al panel
          </Link>

          <header className="mt-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-green-600">
              Administración MercaNova GO
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Seguridad de la cuenta
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-500">
              Controla la contraseña, revisa la
              información del administrador activo y
              administra el cierre seguro de sesión.
            </p>
          </header>

          <div className="mt-9 grid gap-7 lg:grid-cols-[0.85fr_1.15fr]">
            <article className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.45)]">
              <header className="relative overflow-hidden bg-zinc-950 p-7 text-white">
                <div
                  aria-hidden="true"
                  className="absolute -right-14 -top-20 h-52 w-52 rounded-full bg-green-500/20 blur-3xl"
                />

                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500 text-white shadow-lg shadow-green-950/40">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-6 w-6"
                    >
                      <circle
                        cx="12"
                        cy="8"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />

                      <path
                        d="M4.75 20c.6-4.15 3.05-6.25 7.25-6.25S18.65 15.85 19.25 20"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>

                  <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-green-300">
                    Sesión autenticada
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Usuario administrativo
                  </h2>
                </div>
              </header>

              <div className="p-7">
                <dl className="space-y-5">
                  <div>
                    <dt className="text-xs font-black uppercase tracking-wider text-zinc-400">
                      Nombre
                    </dt>

                    <dd className="mt-1 font-black text-zinc-900">
                      {admin?.name ??
                        "Administrador"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-black uppercase tracking-wider text-zinc-400">
                      Correo oficial
                    </dt>

                    <dd className="mt-1 break-all font-black text-zinc-900">
                      {admin?.email ??
                        "Sin correo"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-black uppercase tracking-wider text-zinc-400">
                      Rol
                    </dt>

                    <dd className="mt-2">
                      <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-black text-green-700">
                        {admin
                          ? getRoleLabel(
                              admin.role
                            )
                          : "Administrador"}
                      </span>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-black uppercase tracking-wider text-zinc-400">
                      Último ingreso
                    </dt>

                    <dd className="mt-1 text-sm font-bold leading-6 text-zinc-700">
                      {formatDate(
                        admin?.lastLoginAt ??
                          null
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-black uppercase tracking-wider text-zinc-400">
                      Último cambio de contraseña
                    </dt>

                    <dd className="mt-1 text-sm font-bold leading-6 text-zinc-700">
                      {formatDate(
                        admin?.passwordChangedAt ??
                          null
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-green-700">
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
                      <p className="text-sm font-black text-green-900">
                        Cuenta protegida por Supabase Auth
                      </p>

                      <p className="mt-1 text-xs leading-5 text-green-800">
                        La contraseña no se almacena ni se
                        consulta desde las tablas públicas
                        de MercaNova GO.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={
                    loggingOut || loading
                  }
                  className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm font-black text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loggingOut ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-red-200 border-t-red-700" />
                      Cerrando sesión...
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

                      Cerrar sesión
                    </>
                  )}
                </button>
              </div>
            </article>

            <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.45)] sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-6 w-6"
                  >
                    <path
                      d="M7 10V7a5 5 0 0 1 10 0v3M5.5 10h13v10h-13V10Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M12 14v2.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">
                    Protección de acceso
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-zinc-950 sm:text-3xl">
                    Cambiar contraseña
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Después del cambio se cerrarán todas
                    las sesiones administrativas,
                    incluidas las abiertas en otros
                    dispositivos.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleChangePassword}
                className="mt-8 space-y-5"
              >
                <PasswordField
                  id="current-password"
                  label="Contraseña actual"
                  value={currentPassword}
                  visible={showCurrentPassword}
                  autoComplete="current-password"
                  placeholder="Ingresa la contraseña actual"
                  disabled={loading || loggingOut}
                  onChange={(value) => {
                    setCurrentPassword(value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  onToggleVisibility={() =>
                    setShowCurrentPassword(
                      (current) => !current
                    )
                  }
                />

                <PasswordField
                  id="new-password"
                  label="Nueva contraseña"
                  value={newPassword}
                  visible={showNewPassword}
                  autoComplete="new-password"
                  placeholder="Crea una contraseña robusta"
                  disabled={loading || loggingOut}
                  onChange={(value) => {
                    setNewPassword(value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  onToggleVisibility={() =>
                    setShowNewPassword(
                      (current) => !current
                    )
                  }
                />

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
                      Nivel de seguridad
                    </p>

                    <p
                      className={`text-xs font-black ${
                        passwordStrength.score ===
                        5
                          ? "text-green-700"
                          : passwordStrength.score >=
                              3
                            ? "text-amber-700"
                            : "text-red-600"
                      }`}
                    >
                      {passwordStrength.score ===
                      5
                        ? "Fuerte"
                        : passwordStrength.score >=
                            3
                          ? "Media"
                          : "Insuficiente"}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {Array.from({
                      length: 5,
                    }).map((_, index) => (
                      <span
                        key={index}
                        className={`h-2 rounded-full ${
                          index <
                          passwordStrength.score
                            ? passwordStrength.score ===
                              5
                              ? "bg-green-500"
                              : passwordStrength.score >=
                                  3
                                ? "bg-amber-500"
                                : "bg-red-500"
                            : "bg-zinc-200"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Requirement
                      valid={
                        passwordStrength
                          .requirements
                          .minimumLength
                      }
                      text="Mínimo 10 caracteres"
                    />

                    <Requirement
                      valid={
                        passwordStrength
                          .requirements
                          .uppercase
                      }
                      text="Una letra mayúscula"
                    />

                    <Requirement
                      valid={
                        passwordStrength
                          .requirements
                          .lowercase
                      }
                      text="Una letra minúscula"
                    />

                    <Requirement
                      valid={
                        passwordStrength
                          .requirements.number
                      }
                      text="Un número"
                    />

                    <Requirement
                      valid={
                        passwordStrength
                          .requirements.symbol
                      }
                      text="Un símbolo"
                    />
                  </div>
                </div>

                <PasswordField
                  id="repeat-password"
                  label="Confirmar nueva contraseña"
                  value={repeatPassword}
                  visible={showRepeatPassword}
                  autoComplete="new-password"
                  placeholder="Repite la nueva contraseña"
                  disabled={loading || loggingOut}
                  onChange={(value) => {
                    setRepeatPassword(value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  onToggleVisibility={() =>
                    setShowRepeatPassword(
                      (current) => !current
                    )
                  }
                />

                {repeatPassword && (
                  <div
                    className={`flex items-center gap-2 text-xs font-black ${
                      passwordsMatch
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        passwordsMatch
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      {passwordsMatch
                        ? "✓"
                        : "×"}
                    </span>

                    {passwordsMatch
                      ? "Las contraseñas coinciden"
                      : "Las contraseñas no coinciden"}
                  </div>
                )}

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
                        No fue posible completar el cambio
                      </p>

                      <p className="mt-1 text-sm leading-6 text-red-800">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div
                    role="status"
                    className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-green-700">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="h-5 w-5"
                      >
                        <path
                          d="m5 12 4 4L19 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    <div>
                      <p className="font-black text-green-900">
                        Contraseña actualizada
                      </p>

                      <p className="mt-1 text-sm leading-6 text-green-800">
                        {successMessage}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    loggingOut ||
                    !passwordStrength.valid ||
                    !passwordsMatch ||
                    !currentPassword
                  }
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 px-7 py-4 text-sm font-black text-white shadow-lg shadow-green-900/20 transition hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Actualizando contraseña...
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
                          d="M7 10V7a5 5 0 0 1 10 0v3M5.5 10h13v10h-13V10Z"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        <path
                          d="M12 14v2.5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                      </svg>

                      Actualizar contraseña
                    </>
                  )}
                </button>
              </form>
            </article>
          </div>
        </section>
      </main>
    </AdminGuard>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  autoComplete:
    | "current-password"
    | "new-password";
  placeholder: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
}

function PasswordField({
  id,
  label,
  value,
  visible,
  autoComplete,
  placeholder,
  disabled,
  onChange,
  onToggleVisibility,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-black text-zinc-950"
      >
        {label}
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
              d="M7 10V7a5 5 0 0 1 10 0v3M5.5 10h13v10h-13V10Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent px-1 py-4 font-semibold text-zinc-950 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          disabled={disabled}
          aria-label={
            visible
              ? "Ocultar contraseña"
              : "Mostrar contraseña"
          }
          className="flex w-12 shrink-0 items-center justify-center text-zinc-400 transition hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? (
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
  );
}

interface RequirementProps {
  valid: boolean;
  text: string;
}

function Requirement({
  valid,
  text,
}: RequirementProps) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-bold ${
        valid
          ? "text-green-700"
          : "text-zinc-400"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          valid
            ? "bg-green-100"
            : "bg-zinc-200"
        }`}
      >
        {valid ? "✓" : "·"}
      </span>

      {text}
    </div>
  );
}