"use client";

export default function Hero() {
  return (
    <section className="bg-black py-14">
      <div className="max-w-screen-2xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center rounded-[40px] overflow-hidden bg-gradient-to-r from-black via-zinc-950 to-green-950 shadow-2xl">

          {/* TEXTO */}

          <div className="p-14">

            <span className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-full text-sm font-black">
              🚚 ENTREGA EL MISMO DÍA EN RIOBAMBA
            </span>

            <h1 className="mt-8 text-6xl xl:text-7xl font-black leading-tight">
              Tu mercado,
              <br />
              <span className="text-green-500">
                más rápido.
              </span>
            </h1>

            <p className="mt-8 text-zinc-300 text-xl leading-9 max-w-xl">
              Compra frutas, verduras, lácteos, abarrotes y productos
              frescos desde la comodidad de tu hogar.

              Nuestro compromiso es ofrecerte calidad,
              rapidez y atención personalizada.
            </p>

            <div className="flex gap-5 mt-10">

              <button className="bg-green-600 hover:bg-green-700 transition px-8 py-5 rounded-2xl text-lg font-black">
                Comprar ahora
              </button>

              <button className="border border-zinc-600 hover:border-white transition px-8 py-5 rounded-2xl text-lg font-black">
                Ver ofertas
              </button>

            </div>

            <div className="flex gap-10 mt-12">

              <div>
                <p className="text-4xl font-black text-green-500">
                  +800
                </p>

                <p className="text-zinc-400">
                  Productos
                </p>
              </div>

              <div>
                <p className="text-4xl font-black text-green-500">
                  30 min
                </p>

                <p className="text-zinc-400">
                  Entrega promedio
                </p>
              </div>

              <div>
                <p className="text-4xl font-black text-green-500">
                  100%
                </p>

                <p className="text-zinc-400">
                  Frescura garantizada
                </p>
              </div>

            </div>

          </div>

          {/* IMAGEN */}

          <div className="p-10">

            <div className="overflow-hidden rounded-[32px] shadow-2xl">

              <img
                src="/hero-market.jpg"
                alt="Mercado"
                className="w-full h-[650px] object-cover hover:scale-105 transition duration-700"
              />

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}