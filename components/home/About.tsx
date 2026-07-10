const highlights = [
  {
    title: "Atención personalizada",
    description:
      "Acompañamiento cercano antes, durante y después de cada pedido, con asesores comerciales disponibles para atender consultas y novedades.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-6 w-6"
      >
        <path
          d="M8.5 11.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM2.75 20.25v-1.5a5.75 5.75 0 0 1 5.75-5.75c1.43 0 2.74.52 3.74 1.38M16.75 8.25a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM13.25 20.25v-.75a3.5 3.5 0 0 1 7 0v.75"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Compra inteligente",
    description:
      "Una experiencia digital diseñada para encontrar productos, comparar alternativas y completar compras de manera sencilla y eficiente.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-6 w-6"
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
  {
    title: "Cobertura local",
    description:
      "Operación enfocada en Riobamba, con coordinación de pedidos y entregas adaptadas a las necesidades de las familias de la ciudad.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-6 w-6"
      >
        <path
          d="M12 21s6.25-5.4 6.25-11.1a6.25 6.25 0 1 0-12.5 0C5.75 15.6 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12.25a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Precios actualizados",
    description:
      "Gestión de precios respaldada por información comercial y reglas internas que permiten mantener una oferta competitiva y transparente.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-6 w-6"
      >
        <path
          d="M20.25 12a8.25 8.25 0 1 1-2.42-5.83M20.25 4.75v5h-5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.75 9.25c-.45-.52-1.16-.85-2-.85-1.24 0-2.25.7-2.25 1.62 0 1 1 1.42 2.25 1.73 1.25.31 2.25.72 2.25 1.73 0 .92-1.01 1.62-2.25 1.62-.84 0-1.55-.33-2-.85M12.75 6.75v1.6M12.75 15.15v1.6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Productos seleccionados",
    description:
      "Una oferta organizada de productos frescos, alimentos y artículos esenciales, elegidos para responder a las compras cotidianas del hogar.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-6 w-6"
      >
        <path
          d="M4.25 8.25 12 4l7.75 4.25v8.5L12 21l-7.75-4.25v-8.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m4.75 8.5 7.25 4 7.25-4M12 12.5V21"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m8.25 6.25 7.5 4.25"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Chef MercaNova",
    description:
      "Una experiencia que conecta productos con ideas prácticas, recomendaciones culinarias y nuevas formas de aprovechar cada compra.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-6 w-6"
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
    ),
  },
];

const technologyFeatures = [
  "Motor inteligente de precios",
  "Gestión digital de pedidos",
  "Catálogo organizado por categorías",
  "Atención comercial por WhatsApp",
];

export default function About() {
  return (
    <section
      id="nosotros"
      aria-labelledby="about-title"
      className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-28 top-20 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute -right-32 bottom-12 h-80 w-80 rounded-full bg-lime-100/50 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Tecnología y comercio local
            </div>

            <h2
              id="about-title"
              className="mt-6 max-w-3xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl"
            >
              Una nueva forma de comprar en{" "}
              <span className="text-emerald-600">Riobamba</span>
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              MercaNova GO es una plataforma digital de comercio y distribución
              local que conecta a los hogares de Riobamba con productos frescos,
              alimentos y artículos esenciales, integrando compra inteligente,
              atención personalizada, gestión de pedidos y entrega coordinada.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_26px_70px_-35px_rgba(5,150,105,0.35)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-6 w-6"
                  >
                    <path
                      d="M5.25 19.5V6.75a2 2 0 0 1 2-2h9.5a2 2 0 0 1 2 2V19.5M3.75 19.5h16.5M8.5 8.25h7M8.5 11.75h7M8.5 15.25h4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h3 className="mt-5 text-lg font-extrabold text-slate-950">
                  Nuestra misión
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Facilitar el acceso de las familias a productos frescos y
                  esenciales mediante una experiencia de compra digital ágil,
                  confiable y cercana, generando valor para clientes,
                  proveedores y colaboradores locales.
                </p>
              </div>

              <div className="group rounded-3xl border border-slate-200 bg-slate-950 p-6 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.8)] transition duration-300 hover:-translate-y-1 hover:border-emerald-500/50">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 transition duration-300 group-hover:bg-emerald-500 group-hover:text-white">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-6 w-6"
                  >
                    <path
                      d="M2.75 12s3.25-6 9.25-6 9.25 6 9.25 6-3.25 6-9.25 6-9.25-6-9.25-6Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h3 className="mt-5 text-lg font-extrabold text-white">
                  Nuestra visión
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Consolidarnos como la plataforma tecnológica de comercio y
                  entrega local referente de Riobamba, reconocida por su
                  innovación, calidad de servicio, atención humana y capacidad
                  de transformar la forma en que las familias realizan sus
                  compras cotidianas.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-6 shadow-[0_35px_100px_-45px_rgba(15,23,42,0.8)] sm:p-8">
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl"
              />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                      Ecosistema MercaNova GO
                    </p>

                    <h3 className="mt-3 max-w-md text-2xl font-black tracking-tight text-white sm:text-3xl">
                      Tecnología aplicada al comercio local
                    </h3>
                  </div>

                  <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-emerald-300 sm:flex">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-7 w-7"
                    >
                      <path
                        d="M8.25 3.75h7.5v3.5h3.5v7.5h-3.5v3.5h-7.5v-3.5h-3.5v-7.5h3.5v-3.5Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.25 9.25h5.5v5.5h-5.5v-5.5Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">
                  Integramos herramientas digitales, datos comerciales y
                  atención humana para construir una experiencia confiable,
                  eficiente y pensada para las necesidades reales de nuestra
                  ciudad.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {technologyFeatures.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          aria-hidden="true"
                          className="h-4 w-4"
                        >
                          <path
                            d="m5 10 3 3 7-7"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>

                      <span className="text-sm font-semibold text-slate-100">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-950/30">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="h-6 w-6"
                      >
                        <path
                          d="M4.25 17.75 9.5 12.5l3.25 3.25 7-8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14.75 7.75h5v5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div>
                      <p className="text-sm font-extrabold text-white">
                        Evolución permanente
                      </p>

                      <p className="mt-1 text-sm leading-6 text-emerald-50/80">
                        Una plataforma preparada para crecer junto a clientes,
                        proveedores y aliados comerciales de Riobamba.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-emerald-100 bg-white px-5 py-4 shadow-xl shadow-slate-900/10 xl:block">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M12 3.75 14.45 8.7l5.47.8-3.96 3.85.94 5.45L12 16.23 7.1 18.8l.94-5.45L4.08 9.5l5.47-.8L12 3.75Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Compromiso local
                  </p>
                  <p className="text-sm font-extrabold text-slate-900">
                    Servicio cercano y confiable
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
              Lo que nos diferencia
            </p>

            <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Una experiencia creada para simplificar cada compra
            </h3>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Combinamos servicio, selección de productos y tecnología para
              ofrecer una solución moderna, cercana y adaptada al comercio
              cotidiano de Riobamba.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-38px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-[0_28px_70px_-36px_rgba(5,150,105,0.3)]"
              >
                <div
                  aria-hidden="true"
                  className="absolute -right-14 -top-14 h-32 w-32 rounded-full bg-emerald-100/60 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100"
                />

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white">
                    {item.icon}
                  </div>

                  <h4 className="mt-5 text-lg font-extrabold text-slate-950">
                    {item.title}
                  </h4>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}