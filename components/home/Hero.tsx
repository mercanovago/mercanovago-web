"use client";

import Button from "../shared/Button";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-green-950 via-green-900 to-black">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 py-12 lg:flex-row lg:justify-between lg:px-10 lg:py-20">

        {/* TEXTO */}

        <div className="max-w-xl text-center lg:text-left">

          <span className="inline-block rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white">
            🚚 Entregas el mismo día
          </span>

          <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Tu mercado
            <br />
            <span className="text-green-400">
              fresco directo
            </span>
            <br />
            a casa.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-zinc-300">
            Compra frutas, verduras, lácteos y abarrotes del Mercado
            Mayorista de Riobamba sin salir de casa.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">

            <Button>
              Comprar ahora
            </Button>

            <Button variant="secondary">
              Ver catálogo
            </Button>

          </div>

          <div className="mt-10 grid grid-cols-3 gap-6">

            <div>
              <p className="text-3xl font-black text-green-400">
                +800
              </p>

              <p className="text-sm text-zinc-300">
                Productos
              </p>
            </div>

            <div>
              <p className="text-3xl font-black text-green-400">
                20 min
              </p>

              <p className="text-sm text-zinc-300">
                Entrega promedio
              </p>
            </div>

            <div>
              <p className="text-3xl font-black text-green-400">
                100%
              </p>

              <p className="text-sm text-zinc-300">
                Frescura garantizada
              </p>
            </div>

          </div>

        </div>

        {/* IMAGEN */}

        <div className="w-full max-w-xl">

          <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl">

            <img
              src="/hero-market.jpg"
              alt="MercaNova"
              className="h-full w-full object-cover transition duration-700 hover:scale-105"
            />

          </div>

        </div>

      </div>
    </section>
  );
}