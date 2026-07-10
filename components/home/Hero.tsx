"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[780px] overflow-hidden bg-black">
      <img
        src="/hero-market.jpg"
        alt="MercaNova GO"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

      <div className="relative mx-auto flex min-h-[780px] max-w-7xl items-center px-6 py-20 lg:px-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-green-400/40 bg-black/45 px-5 py-2 text-sm font-black uppercase tracking-wide text-green-300 backdrop-blur">
            MercaNova GO · Riobamba
          </div>

          <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            Tu mercado,
            <br />
            <span className="text-green-400">más fresco</span>
            <br />
            y más rápido.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-200">
            Productos seleccionados, compras inteligentes y entrega directa a
            tu hogar con una experiencia moderna, ágil y confiable.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="#catalogo"
              className="rounded-2xl bg-green-600 px-8 py-4 text-lg font-black text-white shadow-2xl transition hover:-translate-y-1 hover:bg-green-500"
            >
              Comprar ahora
            </Link>

            <Link
              href="/chef"
              className="rounded-2xl bg-white px-8 py-4 text-lg font-black text-green-700 shadow-2xl transition hover:-translate-y-1 hover:bg-green-100"
            >
              Chef MercaNova
            </Link>
          </div>

          <div className="mt-12 grid max-w-xl grid-cols-3 gap-5">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-4xl font-black text-white">+800</p>
              <p className="mt-1 text-sm font-bold text-zinc-300">Productos</p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-4xl font-black text-white">30 min</p>
              <p className="mt-1 text-sm font-bold text-zinc-300">Entrega</p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-4xl font-black text-white">100%</p>
              <p className="mt-1 text-sm font-bold text-zinc-300">Frescura</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}