"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import BrandLogo from "@/components/layout/BrandLogo";
import { supabase } from "@/lib/supabase";

import {
  clearPasswordRecoverySession,
  evaluateRecoveryPasswordStrength,
  getRecoveryUrlError,
  hasVerifiedPasswordRecoverySession,
  invalidateRejectedRecovery,
  markPasswordRecoverySession,
  resetRecoveredAdminPassword,
} from "@/services/adminPasswordRecovery";

type RecoveryStatus = "checking" | "ready" | "invalid" | "success";

interface InvalidRecoveryData {
  code: string | null;
  message: string;
}

export default function AdminResetPasswordPage() {
  const router = useRouter();

  const [status, setStatus] = useState<RecoveryStatus>("checking");

  const [invalidRecovery, setInvalidRecovery] =
    useState<InvalidRecoveryData>({
      code: null,
      message:
        "El enlace de recuperación no es válido, expiró o ya fue utilizado.",
    });

  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const recoveryDetectedRef = useRef(false);
  const mountedRef = useRef(true);

  const passwordStrength = useMemo(
    () => evaluateRecoveryPasswordStrength(newPassword),
    [newPassword]
  );

  const passwordsMatch =
    repeatPassword.length > 0 && newPassword === repeatPassword;

  useEffect(() => {
    mountedRef.current = true;

    const urlError = getRecoveryUrlError();

    if (urlError.hasError) {
      setInvalidRecovery({
        code: urlError.code,
        message:
          urlError.message ??
          "Supabase rechazó el enlace de recuperación.",
      });

      setStatus("invalid");
      void invalidateRejectedRecovery();

      return () => {
        mountedRef.current = false;
      };
    }

    clearPasswordRecoverySession();

    const hashParams = new URLSearchParams(
      window.location.hash.replace(/^#/, "")
    );

    const searchParams = new URLSearchParams(window.location.search);

    const recoveryType =
      hashParams.get("type") ?? searchParams.get("type");

    const hasRecoveryToken =
      recoveryType === "recovery" ||
      hashParams.has("access_token") ||
      searchParams.has("code");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) {
        return;
      }

      if (event === "PASSWORD_RECOVERY" && session?.user) {
        recoveryDetectedRef.current = true;

        markPasswordRecoverySession(session.user.id);

        setErrorMessage("");
        setStatus("ready");
      }
    });

    async function verifyRecoverySession() {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 900);
      });

      if (!mountedRef.current || recoveryDetectedRef.current) {
        return;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!mountedRef.current || recoveryDetectedRef.current) {
        return;
      }

      /*
       * Aceptamos la sesión únicamente cuando esta ruta contiene
       * una señal real del enlace de recuperación y Supabase
       * confirmó al usuario autenticado.
       */
      if (!error && user && hasRecoveryToken) {
        recoveryDetectedRef.current = true;

        markPasswordRecoverySession(user.id);

        setErrorMessage("");
        setStatus("ready");

        return;
      }

      if (
        !error &&
        user &&
        hasVerifiedPasswordRecoverySession(user.id)
      ) {
        recoveryDetectedRef.current = true;
        setStatus("ready");
        return;
      }

      clearPasswordRecoverySession();

      setInvalidRecovery({
        code: "missing_recovery_event",
        message:
          "No se detectó una autorización válida de recuperación. Solicita un enlace nuevo y abre únicamente el mensaje más reciente.",
      });

      setStatus("invalid");
    }

    void verifyRecoverySession();

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (status !== "ready") {
      setErrorMessage(
        "El enlace de recuperación no está autorizado."
      );
      return;
    }

    if (!newPassword) {
      setErrorMessage("Ingresa una nueva contraseña.");
      return;
    }

    if (!passwordStrength.valid) {
      setErrorMessage(
        "La nueva contraseña todavía no cumple todos los requisitos de seguridad."
      );
      return;
    }

    if (!repeatPassword) {
      setErrorMessage("Confirma la nueva contraseña.");
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      await resetRecoveredAdminPassword({
        newPassword,
      });

      setNewPassword("");
      setRepeatPassword("");
      setStatus("success");

      window.setTimeout(() => {
        router.replace("/admin/login?passwordReset=true");
        router.refresh();
      }, 2500);
    } catch (error) {
      console.error("Error restableciendo la contraseña:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible restablecer la contraseña."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7f4] px-4 py-10 sm:px-6">
      <BackgroundDecoration />

      <section className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_40px_120px_-45px_rgba(15,23,42,0.45)]">
        <header className="relative overflow-hidden bg-zinc-950 px-7 py-8 text-white sm:px-9">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-500/20 blur-3xl"
          />

          <div className="relative">
            <BrandLogo size="md" theme="dark" showTagline />

            <div className="mt-9">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-300">
                Protección administrativa
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight">
                Establecer nueva contraseña
              </h1>

              <p className="mt-3 text-sm leading-7 text-zinc-300">
                Crea una nueva clave segura para recuperar el acceso
                administrativo de MercaNova GO.
              </p>
            </div>
          </div>
        </header>

        <div className="p-7 sm:p-9">
          {status === "checking" && <RecoveryChecking />}

          {status === "invalid" && (
            <InvalidRecoveryLink
              code={invalidRecovery.code}
              message={invalidRecovery.message}
            />
          )}

          {status === "success" && <RecoverySuccess />}

          {status === "ready" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-700">
                    <ShieldIcon />
                  </span>

                  <div>
                    <p className="text-sm font-black text-green-900">
                      Enlace verificado
                    </p>

                    <p className="mt-1 text-xs leading-6 text-green-800">
                      Supabase confirmó la solicitud segura de recuperación.
                      Ya puedes establecer una contraseña nueva.
                    </p>
                  </div>
                </div>
              </div>

              <PasswordField
                id="recovery-new-password"
                label="Nueva contraseña"
                value={newPassword}
                visible={showNewPassword}
                placeholder="Crea una contraseña robusta"
                disabled={loading}
                onChange={(value) => {
                  setNewPassword(value);
                  setErrorMessage("");
                }}
                onToggleVisibility={() =>
                  setShowNewPassword((current) => !current)
                }
              />

              <PasswordStrengthPanel
                score={passwordStrength.score}
                requirements={passwordStrength.requirements}
              />

              <PasswordField
                id="recovery-repeat-password"
                label="Confirmar nueva contraseña"
                value={repeatPassword}
                visible={showRepeatPassword}
                placeholder="Repite la nueva contraseña"
                disabled={loading}
                onChange={(value) => {
                  setRepeatPassword(value);
                  setErrorMessage("");
                }}
                onToggleVisibility={() =>
                  setShowRepeatPassword((current) => !current)
                }
              />

              {repeatPassword && (
                <PasswordMatchMessage matches={passwordsMatch} />
              )}

              {errorMessage && <ErrorMessage message={errorMessage} />}

              <button
                type="submit"
                disabled={
                  loading ||
                  !passwordStrength.valid ||
                  !passwordsMatch
                }
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-green-900/20 transition hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Restableciendo contraseña...
                  </>
                ) : (
                  <>
                    <LockIcon />
                    Guardar nueva contraseña
                  </>
                )}
              </button>
            </form>
          )}

          {status !== "success" && (
            <Link
              href="/admin/login"
              className="mt-7 flex items-center justify-center gap-2 text-sm font-black text-zinc-500 transition hover:text-green-700"
            >
              <BackIcon />
              Volver al inicio de sesión
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

function RecoveryChecking() {
  return (
    <div className="py-8 text-center">
      <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

      <h2 className="mt-6 text-2xl font-black text-zinc-950">
        Verificando el enlace
      </h2>

      <p className="mt-3 text-sm leading-7 text-zinc-500">
        Estamos comprobando la autorización segura emitida por Supabase.
      </p>
    </div>
  );
}

interface InvalidRecoveryLinkProps {
  code: string | null;
  message: string;
}

function InvalidRecoveryLink({
  code,
  message,
}: InvalidRecoveryLinkProps) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-700">
        <AlertIcon className="h-8 w-8" />
      </div>

      <h2 className="mt-6 text-2xl font-black text-zinc-950">
        Enlace no válido
      </h2>

      <p className="mt-3 text-sm leading-7 text-zinc-500">{message}</p>

      {code && (
        <p className="mt-3 rounded-xl bg-zinc-100 px-3 py-2 font-mono text-[11px] text-zinc-500">
          Código: {code}
        </p>
      )}

      <Link
        href="/admin/recuperar-contrasena"
        className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-green-600 px-6 py-4 text-sm font-black text-white transition hover:bg-green-700"
      >
        Solicitar un nuevo enlace
      </Link>
    </div>
  );
}

function RecoverySuccess() {
  return (
    <div className="py-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700">
        <CheckIcon />
      </div>

      <h2 className="mt-6 text-2xl font-black text-zinc-950">
        Contraseña restablecida
      </h2>

      <p className="mt-3 text-sm leading-7 text-zinc-600">
        La contraseña fue guardada correctamente y las sesiones
        administrativas anteriores fueron cerradas.
      </p>

      <p className="mt-4 text-xs font-bold text-zinc-400">
        Serás enviado al inicio de sesión para ingresar con tu nueva
        contraseña.
      </p>

      <span className="mx-auto mt-6 block h-8 w-8 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />
    </div>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  visible: boolean;
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
          <LockIcon />
        </span>

        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent px-1 py-4 font-semibold text-zinc-950 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          disabled={disabled}
          aria-label={
            visible ? "Ocultar contraseña" : "Mostrar contraseña"
          }
          className="flex w-12 shrink-0 items-center justify-center text-zinc-400 transition hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <EyeIcon hidden={visible} />
        </button>
      </div>
    </div>
  );
}

interface PasswordStrengthPanelProps {
  score: number;
  requirements: {
    minimumLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
  };
}

function PasswordStrengthPanel({
  score,
  requirements,
}: PasswordStrengthPanelProps) {
  const strengthLabel =
    score === 5
      ? "Fuerte"
      : score >= 3
        ? "Media"
        : "Insuficiente";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
          Nivel de seguridad
        </p>

        <p
          className={`text-xs font-black ${
            score === 5
              ? "text-green-700"
              : score >= 3
                ? "text-amber-700"
                : "text-red-600"
          }`}
        >
          {strengthLabel}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={`h-2 rounded-full ${
              index < score
                ? score === 5
                  ? "bg-green-500"
                  : score >= 3
                    ? "bg-amber-500"
                    : "bg-red-500"
                : "bg-zinc-200"
            }`}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Requirement
          valid={requirements.minimumLength}
          text="Mínimo 10 caracteres"
        />

        <Requirement
          valid={requirements.uppercase}
          text="Una letra mayúscula"
        />

        <Requirement
          valid={requirements.lowercase}
          text="Una letra minúscula"
        />

        <Requirement valid={requirements.number} text="Un número" />

        <Requirement valid={requirements.symbol} text="Un símbolo" />
      </div>
    </div>
  );
}

interface RequirementProps {
  valid: boolean;
  text: string;
}

function Requirement({ valid, text }: RequirementProps) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-bold ${
        valid ? "text-green-700" : "text-zinc-400"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          valid ? "bg-green-100" : "bg-zinc-200"
        }`}
      >
        {valid ? (
          <CheckIcon className="h-3.5 w-3.5" />
        ) : (
          <span className="h-1 w-1 rounded-full bg-current" />
        )}
      </span>

      {text}
    </div>
  );
}

interface PasswordMatchMessageProps {
  matches: boolean;
}

function PasswordMatchMessage({
  matches,
}: PasswordMatchMessageProps) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-black ${
        matches ? "text-green-700" : "text-red-600"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full ${
          matches ? "bg-green-100" : "bg-red-100"
        }`}
      >
        {matches ? (
          <CheckIcon className="h-3.5 w-3.5" />
        ) : (
          <CloseIcon />
        )}
      </span>

      {matches
        ? "Las contraseñas coinciden"
        : "Las contraseñas no coinciden"}
    </div>
  );
}

interface ErrorMessageProps {
  message: string;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
        <AlertIcon />
      </span>

      <div>
        <p className="font-black text-red-900">
          No fue posible restablecer la contraseña
        </p>

        <p className="mt-1 text-sm leading-6 text-red-800">{message}</p>
      </div>
    </div>
  );
}

function BackgroundDecoration() {
  return (
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
  );
}

interface IconProps {
  className?: string;
}

function ShieldIcon() {
  return (
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
  );
}

function LockIcon() {
  return (
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
  );
}

function AlertIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
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

function CheckIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <path
        d="m6 6 8 8M14 6l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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

interface EyeIconProps {
  hidden: boolean;
}

function EyeIcon({ hidden }: EyeIconProps) {
  if (hidden) {
    return (
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
    );
  }

  return (
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
  );
}