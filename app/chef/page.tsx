"use client";

import Link from "next/link";

import { CartProvider } from "@/components/cart/CartContext";
import ChefSearch from "@/components/chef/ChefSearch";
import BrandLogo from "@/components/layout/BrandLogo";

const chefBenefits = [
  {
    title: "Ideas para cocinar",
    description:
      "Recibe sugerencias según el plato, ocasión o ingredientes que tengas disponibles.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path
          d="M9 18.25h6M10 21h4M8.5 14.5a6 6 0 1 1 7 0c-1.05.72-1.5 1.35-1.5 2.25h-4c0-.9-.45-1.53-1.5-2.25Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Costo aproximado",
    description:
      "Conoce una estimación del valor de los ingredientes antes de agregarlos a tu canasta.",
    icon: (
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
          d="M14.75 8.5c-.55-.58-1.4-.9-2.3-.9-1.38 0-2.45.72-2.45 1.7 0 1.05 1.08 1.48 2.45 1.82 1.37.34 2.45.77 2.45 1.83 0 .98-1.07 1.7-2.45 1.7-.9 0-1.75-.32-2.3-.9M12.45 5.75V7.5M12.45 14.75v1.75"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Compra simplificada",
    description:
      "Encuentra productos relacionados y prepara tu pedido desde una sola experiencia.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path
          d="M3.75 5.25h2l1.65 9.15a2 2 0 0 0 1.97 1.65h7.88a2 2 0 0 0 1.95-1.55l1.05-4.75H7.1M9.5 20.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM17.75 20.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const exampleQueries = [
  "Quiero preparar un locro para 6 personas",
  "Necesito una cena rápida y económica",
  "¿Qué puedo cocinar con pollo y papas?",
];

export default function ChefPage() {
  return (
    <CartProvider>
      <main className="min-h-screen bg-[#f4f7f4] text-zinc-950">
        <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex min-h-[82px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              aria-label="Volver al inicio de MercaNova GO"
              className="shrink-0"
            >
              <BrandLogo
                size="md"
                showTagline
              />
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-black text-zinc-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
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

              <span className="hidden sm:inline">
                Volver a la tienda
              </span>

              <span className="sm:hidden">
                Volver
              </span>
            </Link>
          </div>
        </header>

        <section className="relative overflow-hidden bg-slate-950">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-green-500/20 blur-3xl" />
            <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

            <svg
              viewBox="0 0 1200 600"
              fill="none"
              className="absolute inset-0 h-full w-full opacity-[0.05]"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0 500C160 390 320 510 480 390C650 265 780 390 940 240C1050 135 1130 155 1200 195"
                stroke="white"
                strokeWidth="2"
              />
              <path
                d="M0 370C170 270 340 390 520 275C690 165 820 280 965 145C1065 55 1140 80 1200 110"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-green-300">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Asistente inteligente de cocina
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Chef{" "}
                <span className="text-green-400">
                  MercaNova GO
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Cuéntanos qué quieres preparar y Chef MercaNova GO te ayudará a
                encontrar ingredientes, organizar tu compra y calcular un costo
                aproximado de forma rápida y sencilla.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-200">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                    className="h-4 w-4 text-green-400"
                  >
                    <path
                      d="m5 10 3 3 7-7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  Recomendaciones prácticas
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-200">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                    className="h-4 w-4 text-green-400"
                  >
                    <path
                      d="m5 10 3 3 7-7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  Productos relacionados
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-200">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                    className="h-4 w-4 text-green-400"
                  >
                    <path
                      d="m5 10 3 3 7-7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  Compra inteligente
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-[0_35px_100px_-45px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:p-8">
                <div
                  aria-hidden="true"
                  className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-green-500/20 blur-3xl"
                />

                <div className="relative">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-500 text-white shadow-lg shadow-green-950/40">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="h-8 w-8"
                      >
                        <path
                          d="M7.25 10.25A4 4 0 0 1 8.4 2.42a4.5 4.5 0 0 1 7.2 0 4 4 0 0 1 1.15 7.83M6.5 10.25h11v8.5a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-8.5Z"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 15.25h6M9 18h6"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-300">
                        Tecnología para tu cocina
                      </p>

                      <h2 className="mt-2 text-2xl font-black text-white">
                        Cocina mejor, compra más fácil
                      </h2>
                    </div>
                  </div>

                  <div className="mt-7 space-y-3">
                    {exampleQueries.map((query) => (
                      <div
                        key={query}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-500/20 text-green-300">
                          <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            aria-hidden="true"
                            className="h-4 w-4"
                          >
                            <path
                              d="M5.5 5.75h9M5.5 9.75h6M4.25 16.25l1.1-3.3A6.5 6.5 0 1 1 8 15.4l-3.75.85Z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>

                        <p className="text-sm font-semibold leading-6 text-slate-200">
                          “{query}”
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-3 rounded-2xl border border-green-400/20 bg-green-500/10 px-4 py-3">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
                    </span>

                    <p className="text-sm font-semibold text-green-100">
                      Chef MercaNova GO está listo para ayudarte.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-3">
            {chefBenefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                  {benefit.icon}
                </div>

                <h2 className="mt-4 text-base font-black text-zinc-950">
                  {benefit.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
            <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-5 sm:px-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white">
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
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-600">
                    Comienza tu consulta
                  </p>

                  <h2 className="mt-1 text-xl font-black text-zinc-950 sm:text-2xl">
                    ¿Qué deseas preparar hoy?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Describe el plato, número de personas, presupuesto o
                    ingredientes disponibles.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              <ChefSearch />
            </div>
          </div>
        </section>

        <footer className="border-t border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <BrandLogo
              size="sm"
              showTagline={false}
            />

            <p className="text-sm font-medium text-zinc-500">
              Chef MercaNova GO · Tecnología aplicada a tus compras cotidianas.
            </p>
          </div>
        </footer>
      </main>
    </CartProvider>
  );
}