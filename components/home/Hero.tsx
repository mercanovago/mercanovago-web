"use client";

import Link from "next/link";
import Button from "../shared/Button";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-green-950 via-green-900 to-black">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 py-12 lg:flex-row lg:justify-between lg:px-10 lg:py-20">
        <div className="max-w-xl text-center lg:text-left">
          <span className="inline-block rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white">
            🚚 Entregas el mismo día
          </span>

          <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Tu mercado
            <br />
            <span className="text-green-400">fresco directo</span>
            <br />
            a casa.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-zinc-300">
            Compra frutas, verduras, lácteos y abarrotes del Mercado Mayorista
            de Riobamba sin salir de casa.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
            <Button>Comprar ahora</Button>

            <Button variant="secondary">Ver catálogo</Button>

            <Link
              href="/chef"
              className="rounded-2xl bg-white px-6 py-4 font-black text-green-700 shadow-lg transition hover:-translate-y-1 hover:bg-green-100"
            >
              🍲 Chef MercaNova
            </Link>
          </div>

          <div className="mt-8 rounded-3xl border border-green-400/30 bg-white/10 p-5 text-left backdrop-blur">
            <p className="text-sm font-black uppercase tracking-widest text-green-300">
              ¿No sabes qué cocinar hoy?
            </p>

            <p className="mt-2 text-lg font-bold text-white">
              Elige una receta y agrega sus ingredientes a tu canasta en
              segundos.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6">
            <div>
              <p className="text-3xl font-black text-green-400">+800</p>
              <p className="text-sm text-zinc-300">Productos</p>
            </div>

            <div>
              <p className="text-3xl font-black text-green-400">20 min</p>
              <p className="text-sm text-zinc-300">Entrega promedio</p>
            </div>

            <div>
              <p className="text-3xl font-black text-green-400">100%</p>
              <p className="text-sm text-zinc-300">Frescura garantizada</p>
            </div>
          </div>
        </div>

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