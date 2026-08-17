import Link from "next/link";

interface CatalogComingSoonProps {
  eyebrow: string;
  title: string;
  description: string;
  nextStep: string;
}

export default function CatalogComingSoon({
  eyebrow,
  title,
  description,
  nextStep,
}: CatalogComingSoonProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_25px_70px_-50px_rgba(15,23,42,0.55)]">
      <div className="relative overflow-hidden bg-zinc-950 px-6 py-9 text-white sm:px-8 lg:px-10">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-green-500/20 blur-3xl"
        />

        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-green-300">
            {eyebrow}
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            {title}
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
            {description}
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8 lg:p-10">
        <div className="rounded-[1.75rem] border border-dashed border-green-300 bg-green-50 p-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-white">
            <ToolIcon />
          </div>

          <h3 className="mt-5 text-xl font-black text-green-950">
            Infraestructura preparada
          </h3>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-green-800">
            Esta herramienta ya forma parte del Workspace del
            Catálogo. Su funcionalidad será incorporada en el
            siguiente sprint sin alterar el resto de la
            operación administrativa.
          </p>

          <div className="mx-auto mt-6 max-w-xl rounded-2xl bg-white p-4 text-left shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
              Próximo entregable
            </p>

            <p className="mt-2 text-sm font-black text-zinc-900">
              {nextStep}
            </p>
          </div>

          <Link
            href="/admin/catalog"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-2xl bg-zinc-950 px-6 text-sm font-black text-white transition hover:bg-green-700"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

function ToolIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-7 w-7"
    >
      <path
        d="M14.5 5.5a4 4 0 0 0-5 5L4 16l4 4 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-3-3 1.5-3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}