"use client";

import { useEffect, useRef, useState } from "react";

type CommercialAdvisor = {
  name: string;
  role: string;
  phone: string;
  whatsapp: string;
  description: string;
  initials: string;
};

const commercialAdvisors: CommercialAdvisor[] = [
  {
    name: "Elizabeth",
    role: "Asesora Comercial 1",
    phone: "096 348 8825",
    whatsapp: "593963488825",
    description: "Pedidos, consultas y seguimiento comercial.",
    initials: "EL",
  },
  {
    name: "Andrés",
    role: "Asesor Comercial 2",
    phone: "098 317 0593",
    whatsapp: "593983170593",
    description: "Pedidos, atención y gestión de novedades.",
    initials: "AN",
  },
];

function buildWhatsappLink(
  whatsapp: string,
  advisorName: string
): string {
  const message = encodeURIComponent(
    `Hola ${advisorName}, deseo recibir atención de MercaNova GO para realizar una consulta o pedido.`
  );

  return `https://wa.me/${whatsapp}?text=${message}`;
}

export default function CustomerSupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const supportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        supportRef.current &&
        !supportRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      ref={supportRef}
      className="fixed bottom-5 left-4 z-[70] sm:bottom-6 sm:left-6"
    >
      <div
        aria-hidden={!isOpen}
        className={`absolute bottom-[calc(100%+0.9rem)] left-0 w-[calc(100vw-2rem)] max-w-[360px] origin-bottom-left transition-all duration-300 ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_28px_90px_-28px_rgba(15,23,42,0.55)]">
          <div className="relative overflow-hidden bg-slate-950 px-5 py-5">
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl"
            />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-950/30">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-6 w-6"
                  >
                    <path
                      d="M7.75 18.25 4 20l1-4.1A8 8 0 1 1 7.75 18.25Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.5 9.25h7M8.5 12.5h5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                    Atención al cliente
                  </p>

                  <h2 className="mt-1 text-lg font-black text-white">
                    ¿Cómo podemos ayudarte?
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    Selecciona un asesor y conversa directamente por WhatsApp.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar centro de atención"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-200 transition hover:bg-white/20 hover:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path
                    d="m5 5 10 10M15 5 5 15"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-3 p-4">
            {commercialAdvisors.map((advisor) => (
              <a
                key={advisor.name}
                href={buildWhatsappLink(
                  advisor.whatsapp,
                  advisor.name
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                aria-label={`Contactar por WhatsApp a ${advisor.name}`}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-lg hover:shadow-emerald-900/5 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-black tracking-wide text-white shadow-md shadow-emerald-900/15">
                  {advisor.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-black text-slate-950">
                      {advisor.name}
                    </h3>

                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  </div>

                  <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                    {advisor.role}
                  </p>

                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                    {advisor.description}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M7.3 19.15 3.75 20.25l1.15-3.45A8.5 8.5 0 1 1 7.3 19.15Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.35 8.15c.15-.35.32-.36.62-.37h.53c.17 0 .43.06.55.35l.72 1.75c.1.25.05.45-.08.65l-.52.7c-.12.16-.24.31-.1.55.14.25.63 1.01 1.38 1.64.95.85 1.75 1.12 2 1.25.25.12.4.1.55-.08l.83-.96c.18-.2.38-.16.63-.07l1.72.81c.28.13.47.2.54.32.07.12.07.7-.17 1.34-.23.64-1.34 1.22-1.85 1.3-.47.08-1.07.12-1.73-.1-.4-.13-.92-.3-1.58-.58-.28-.12-2.48-.92-4.22-3.23-1.47-1.95-1.67-3.36-1.5-4.06.1-.41.43-.93.64-1.17Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </a>
            ))}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>

                <p className="text-xs font-semibold text-slate-600">
                  Atención comercial directa
                </p>
              </div>

              <a
                href="#contacto-comercial"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-emerald-700 transition hover:text-emerald-800"
              >
                Ver contactos
              </a>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="mercanova-support-panel"
        aria-label={
          isOpen
            ? "Cerrar centro de atención"
            : "Abrir centro de atención"
        }
        className="group flex items-center gap-3 rounded-full border border-white/20 bg-slate-950 p-2 pr-4 text-white shadow-[0_18px_45px_-16px_rgba(15,23,42,0.8)] transition duration-300 hover:-translate-y-1 hover:bg-slate-900 hover:shadow-[0_24px_55px_-16px_rgba(15,23,42,0.9)] focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
      >
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-950/30 transition duration-300 group-hover:bg-emerald-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={`h-6 w-6 transition duration-300 ${
              isOpen ? "scale-90 rotate-6" : "scale-100 rotate-0"
            }`}
          >
            {isOpen ? (
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <>
                <path
                  d="M7.75 18.25 4 20l1-4.1A8 8 0 1 1 7.75 18.25Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 9.25h7M8.5 12.5h5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>

          {!isOpen && (
            <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-emerald-300" />
          )}
        </span>

        <span className="hidden text-left sm:block">
          <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-300">
            ¿Necesitas ayuda?
          </span>

          <span className="mt-0.5 block text-sm font-extrabold">
            Atención al cliente
          </span>
        </span>
      </button>
    </div>
  );
}