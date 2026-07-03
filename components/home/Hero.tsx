export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="relative overflow-hidden rounded-[40px] border border-zinc-800 bg-gradient-to-r from-black via-zinc-950 to-green-950 min-h-[560px] flex items-center">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,#16a34a55,transparent_60%)]" />

        <div className="relative z-10 max-w-2xl p-10">
          <p className="inline-flex rounded-full bg-green-600 px-5 py-2 text-sm font-black mb-6">
            DE LA HUERTA A TU HOGAR · RIOBAMBA
          </p>

          <h2 className="text-6xl md:text-7xl font-black leading-[0.9] mb-6">
            Tu mercado,
            <br />
            <span className="text-green-400">más rápido.</span>
          </h2>

          <p className="text-xl text-zinc-300 mb-8">
            Productos frescos, seleccionados con cuidado y entregados hasta tu puerta.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-green-600 hover:bg-green-500 transition px-8 py-4 rounded-2xl text-xl font-black">
              Comprar ahora
            </button>

            <button className="border border-zinc-700 hover:border-green-500 transition px-8 py-4 rounded-2xl text-xl font-black">
              Ver ofertas
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}