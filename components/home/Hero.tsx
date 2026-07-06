"use client";

export default function Hero() {
  return (
    <section className="bg-zinc-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl overflow-hidden rounded-[32px] bg-gradient-to-br from-green-950 via-zinc-950 to-black shadow-2xl">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="p-6 sm:p-10 lg:p-14">
            <span className="inline-flex rounded-full bg-green-600 px-4 py-2 text-xs font-black text-white sm:text-sm">
              Entrega el mismo día · Riobamba
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-7xl">
              Tu mercado fresco,
              <span className="block text-green-400">
                directo a casa.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg lg:text-xl">
              Compra frutas, verduras, lácteos y abarrotes seleccionados con
              cuidado. Atención cercana, rápida y confiable.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#catalogo"
                className="rounded-2xl bg-green-600 px-6 py-4 text-center font-black text-white hover:bg-green-700"
              >
                Comprar ahora
              </a>

              <a
                href="#catalogo"
                className="rounded-2xl border border-white/20 px-6 py-4 text-center font-black text-white hover:border-green-400"
              >
                Ver productos
              </a>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-white">
              <div>
                <p className="text-2xl font-black text-green-400 sm:text-3xl">
                  +800
                </p>
                <p className="text-xs text-zinc-400 sm:text-sm">productos</p>
              </div>

              <div>
                <p className="text-2xl font-black text-green-400 sm:text-3xl">
                  30 min
                </p>
                <p className="text-xs text-zinc-400 sm:text-sm">promedio</p>
              </div>

              <div>
                <p className="text-2xl font-black text-green-400 sm:text-3xl">
                  100%
                </p>
                <p className="text-xs text-zinc-400 sm:text-sm">frescura</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            <img
              src="/hero-market.jpg"
              alt="MercaNova GO productos frescos"
              className="h-72 w-full rounded-[28px] object-cover shadow-2xl sm:h-96 lg:h-[560px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}