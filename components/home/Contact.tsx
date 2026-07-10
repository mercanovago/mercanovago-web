const commercialAdvisors = [
  {
    name: "Elizabeth",
    role: "Asesora Comercial 1",
    phone: "096 348 8825",
    whatsapp: "593963488825",
    description:
      "Pedidos, consultas de productos y seguimiento comercial personalizado.",
    initials: "EL",
  },
  {
    name: "Andrés",
    role: "Asesor Comercial 2",
    phone: "098 317 0593",
    whatsapp: "593983170593",
    description:
      "Atención de pedidos, gestión de novedades y acompañamiento al cliente.",
    initials: "AN",
  },
];

const serviceDetails = [
  {
    title: "Cobertura",
    value: "Riobamba, Ecuador",
    description:
      "Atención y entrega coordinada dentro de nuestra zona de cobertura local.",
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
    title: "Atención comercial",
    value: "Pedidos y consultas",
    description:
      "Comunicación directa con nuestros asesores mediante WhatsApp.",
    icon: (
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
    ),
  },
  {
    title: "Seguimiento",
    value: "Acompañamiento cercano",
    description:
      "Información sobre pedidos, disponibilidad y novedades durante el proceso.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-6 w-6"
      >
        <path
          d="M4.75 12a7.25 7.25 0 1 0 2.12-5.13M4.75 5.75v4.5h4.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 8.25v4.25l2.75 1.75"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
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

export default function Contact() {
  return (
    <section
      id="contacto-comercial"
      aria-labelledby="contact-title"
      className="relative overflow-hidden bg-slate-950 py-20 sm:py-24 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <svg
          viewBox="0 0 1200 500"
          fill="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-[0.04]"
          preserveAspectRatio="none"
        >
          <path
            d="M0 420C180 350 310 470 480 380C650 290 760 370 920 250C1030 168 1110 150 1200 190"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M0 320C160 240 330 360 500 270C680 175 790 280 940 150C1040 65 1125 80 1200 120"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Atención MercaNova GO
            </div>

            <h2
              id="contact-title"
              className="mt-6 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Estamos cerca para ayudarte con{" "}
              <span className="text-emerald-400">cada compra</span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Nuestro equipo comercial está disponible para ayudarte con
              pedidos, consultas, disponibilidad de productos y seguimiento.
              Elige uno de nuestros asesores y comunícate directamente por
              WhatsApp.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-950/40">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-6 w-6"
                  >
                    <path
                      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M9.25 9.25a2.75 2.75 0 0 1 5.3 1c0 2-2.55 2.25-2.55 4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 17.25h.01"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    Atención personalizada
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    No estás hablando con un sistema automático. Nuestro modelo
                    de atención conecta a cada cliente con un asesor comercial
                    para ofrecer una experiencia más humana, directa y
                    confiable.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {serviceDetails.map((detail) => (
                <article
                  key={detail.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.07]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
                    {detail.icon}
                  </div>

                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                    {detail.title}
                  </p>

                  <h3 className="mt-2 text-base font-extrabold text-white">
                    {detail.value}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {detail.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <div className="grid gap-6 md:grid-cols-2">
              {commercialAdvisors.map((advisor, index) => (
                <article
                  key={advisor.name}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white p-6 shadow-[0_35px_90px_-45px_rgba(0,0,0,0.8)] transition duration-300 hover:-translate-y-1.5 hover:border-emerald-400/40 sm:p-7"
                >
                  <div
                    aria-hidden="true"
                    className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-100 opacity-70 blur-3xl transition duration-300 group-hover:bg-emerald-200"
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-black tracking-wide text-white shadow-lg shadow-emerald-900/20">
                        {advisor.initials}
                      </div>

                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        Asesor {index + 1}
                      </span>
                    </div>

                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                      {advisor.role}
                    </p>

                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                      {advisor.name}
                    </h3>

                    <p className="mt-4 min-h-[84px] text-sm leading-7 text-slate-600">
                      {advisor.description}
                    </p>

                    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                          className="h-5 w-5"
                        >
                          <path
                            d="M8.25 3.75h7.5a2 2 0 0 1 2 2v12.5a2 2 0 0 1-2 2h-7.5a2 2 0 0 1-2-2V5.75a2 2 0 0 1 2-2Z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10.25 17.25h3.5"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Contacto directo
                        </p>

                        <p className="text-sm font-extrabold text-slate-900">
                          {advisor.phone}
                        </p>
                      </div>
                    </div>

                    <a
                      href={buildWhatsappLink(
                        advisor.whatsapp,
                        advisor.name
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Contactar por WhatsApp a ${advisor.name}`}
                      className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-emerald-900/20 transition duration-300 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                    >
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

                      Contactar por WhatsApp

                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                        className="h-4 w-4 transition duration-300 group-hover:translate-x-1"
                      >
                        <path
                          d="M4.5 10h11M11 5.5l4.5 4.5-4.5 4.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-transparent p-6 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-950/30">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-6 w-6"
                    >
                      <path
                        d="M5.25 18.75h13.5M7 18.75V9.5l5-4.25 5 4.25v9.25M9.5 18.75v-5h5v5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      Comercio local con atención humana
                    </h3>

                    <p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">
                      MercaNova GO combina tecnología, gestión comercial y
                      cercanía para ofrecer una experiencia de compra pensada
                      para las familias de Riobamba.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Atención local
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}