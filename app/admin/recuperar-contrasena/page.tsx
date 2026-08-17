"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import BrandLogo from "@/components/layout/BrandLogo";
import { requestAdminPasswordRecovery } from "@/services/adminPasswordRecovery";

const OFFICIAL_ADMIN_EMAIL = "mercanovago@gmail.com";

export default function AdminPasswordRecoveryPage() {
  const [email, setEmail] = useState(OFFICIAL_ADMIN_EMAIL);
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setErrorMessage("");

      await requestAdminPasswordRecovery({
        email,
      });

      setRequestSent(true);
    } catch (error) {
      console.error("Error enviando la recuperación:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible enviar el enlace de recuperación."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSendAnotherLink() {
    setRequestSent(false);
    setErrorMessage("");
    setEmail(OFFICIAL_ADMIN_EMAIL);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7f4] px-4 py-10 sm:px-6">
      <BackgroundDecoration />

      <section className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_40px_120px_-45px_rgba(15,23,42,0.45)]">
        <header className="relative overflow-hidden bg-zinc-950 px-7 py-8 text-white sm:px-9">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-500/20 blur-3xl"
          />

          <div className="relative">
            <BrandLogo size="md" theme="dark" showTagline />

            <div className="mt-9">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-300">
                Recuperación segura
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight">
                Recuperar contraseña
              </h1>

              <p className="mt-3 text-sm leading-7 text-zinc-300">
                Enviaremos un enlace protegido exclusivamente al correo
                administrativo oficial de MercaNova GO.
              </p>
            </div>
          </div>
        </header>

        <div className="p-7 sm:p-9">
          {requestSent ? (
            <RecoveryRequestSuccess
              onSendAnotherLink={handleSendAnotherLink}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="recovery-email"
                  className="text-sm font-black text-zinc-950"
                >
                  Correo administrativo oficial
                </label>

                <div className="mt-2 flex overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 transition focus-within:border-green-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-100">
                  <span className="flex items-center px-4 text-zinc-400">
                    <MailIcon />
                  </span>

                  <input
                    id="recovery-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrorMessage("");
                    }}
                    disabled={loading}
                    placeholder="Correo administrativo"
                    className="min-w-0 flex-1 bg-transparent px-1 py-4 pr-4 font-semibold text-zinc-950 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-700">
                    <ShieldIcon />
                  </span>

                  <div>
                    <p className="text-sm font-black text-green-900">
                      Proceso protegido
                    </p>

                    <p className="mt-1 text-xs leading-6 text-green-800">
                      La contraseña actual nunca será enviada, almacenada ni
                      mostrada durante este proceso.
                    </p>
                  </div>
                </div>
              </div>

              {errorMessage && <ErrorMessage message={errorMessage} />}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-green-900/20 transition hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Enviando enlace...
                  </>
                ) : (
                  <>
                    <MailIcon />
                    Enviar enlace de recuperación
                  </>
                )}
              </button>
            </form>
          )}

          <Link
            href="/admin/login"
            className="mt-7 flex items-center justify-center gap-2 text-sm font-black text-zinc-500 transition hover:text-green-700"
          >
            <BackIcon />
            Volver al inicio de sesión
          </Link>
        </div>
      </section>
    </main>
  );
}

interface RecoveryRequestSuccessProps {
  onSendAnotherLink: () => void;
}

function RecoveryRequestSuccess({
  onSendAnotherLink,
}: RecoveryRequestSuccessProps) {
  return (
    <div>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700">
        <MailIcon className="h-8 w-8" />
      </div>

      <div className="mt-6 text-center">
        <h2 className="text-2xl font-black text-zinc-950">
          Revisa el correo oficial
        </h2>

        <p className="mt-3 text-sm leading-7 text-zinc-600">
          Supabase envió un enlace de recuperación a:
        </p>

        <p className="mt-2 break-all font-black text-green-700">
          {OFFICIAL_ADMIN_EMAIL}
        </p>

        <p className="mt-4 text-sm leading-7 text-zinc-500">
          Abre únicamente el mensaje más reciente y utiliza su enlace para
          establecer una nueva contraseña.
        </p>
      </div>

      <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-black text-amber-900">
          ¿No encuentras el mensaje?
        </p>

        <p className="mt-1 text-xs leading-6 text-amber-800">
          Revisa spam, promociones o correo no deseado. La recepción puede
          tardar algunos minutos.
        </p>
      </div>

      <button
        type="button"
        onClick={onSendAnotherLink}
        className="mt-6 w-full rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm font-black text-zinc-700 transition hover:bg-zinc-50"
      >
        Enviar otro enlace
      </button>
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
          No fue posible enviar el enlace
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

function MailIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
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
  );
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

function AlertIcon() {
  return (
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