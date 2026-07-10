import Link from "next/link";

const advisors = [
  {
    name: "Elizabeth",
    role: "Asesora Comercial 1",
    phone: "0963488825",
    whatsapp: "593963488825",
    description: "Pedidos, consultas y seguimiento comercial.",
  },
  {
    name: "Andrés",
    role: "Asesor Comercial 2",
    phone: "0983170593",
    whatsapp: "593983170593",
    description: "Pedidos, atención y gestión de novedades.",
  },
];

const quickLinks = [
  { label: "Inicio", href: "/" },
  { label: "Categorías", href: "/#categorias" },
  { label: "Catálogo", href: "/#catalogo" },
  { label: "Ofertas", href: "/#ofertas" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Chef MercaNova", href: "/chef" },
];

export default function Footer() {
  return (
    <footer
      id="contacto"
      className="border-t border-zinc-800 bg-zinc-950 text-zinc-300"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.8fr_1.5fr]">
          {/* IDENTIDAD */}
          <div>
            <Link
              href="/"
              className="inline-block"
              aria-label="Ir al inicio de MercaNova GO"
            >
              <div className="flex items-end gap-1 leading-none">
                <span className="text-3xl font-black tracking-tight text-white">
                  Merca
                </span>

                <span className="text-3xl font-black tracking-tight text-green-500">
                  Nova
                </span>
              </div>

              <span className="mt-1 block text-xs font-black italic uppercase tracking-[0.24em] text-green-500">
                GO
              </span>
            </Link>

            <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-400">
              Plataforma digital de comercio y distribución local que conecta
              a los hogares de Riobamba con productos frescos, alimentos y
              artículos esenciales.
            </p>

            <div className="mt-7 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-green-400">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </div>

                <div>
                  <p className="font-black text-white">Cobertura local</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Riobamba y sectores cercanos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-green-400">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </div>

                <div>
                  <p className="font-black text-white">Horario de atención</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Todos los días, de 08:00 a 18:00.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* NAVEGACIÓN */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-green-400">
              Explora MercaNova
            </p>

            <h3 className="mt-3 text-xl font-black text-white">
              Accesos rápidos
            </h3>

            <nav className="mt-6 grid gap-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm font-bold text-zinc-300 transition hover:border-green-500/40 hover:bg-green-500/10 hover:text-white"
                >
                  {item.label}

                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 transition group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              ))}
            </nav>
          </div>

          {/* CENTRO DE ATENCIÓN */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-green-400">
              Centro de atención
            </p>

            <h3 className="mt-3 text-2xl font-black text-white">
              Estamos para ayudarte
            </h3>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
              Comunícate con uno de nuestros asesores para realizar pedidos,
              resolver consultas o recibir acompañamiento durante tu compra.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {advisors.map((advisor) => {
                const message = encodeURIComponent(
                  `Hola ${advisor.name}, necesito atención de MercaNova GO.`
                );

                return (
                  <article
                    key={advisor.phone}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:-translate-y-1 hover:border-green-500/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-white">
                          {advisor.name}
                        </p>

                        <p className="mt-1 text-xs font-black uppercase tracking-wide text-green-400">
                          {advisor.role}
                        </p>
                      </div>

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                        </svg>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                      {advisor.description}
                    </p>

                    <p className="mt-4 text-lg font-black text-white">
                      {advisor.phone}
                    </p>

                    <a
                      href={`https://wa.me/${advisor.whatsapp}?text=${message}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-black text-white transition hover:bg-green-500"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M20 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.1A8.5 8.5 0 1 1 20 11.5Z" />
                        <path d="M8.5 8.5c.5 3 2 4.5 5 5" />
                      </svg>

                      Contactar por WhatsApp
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-zinc-800 pt-7 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} MercaNova GO. Todos los derechos
            reservados.
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>Compra local</span>
            <span>Atención personalizada</span>
            <span>Entrega coordinada</span>
          </div>
        </div>
      </div>
    </footer>
  );
}