"use client";

import ChefSearch from "@/components/chef/ChefSearch";

export default function ChefPage() {
  return (
    <main className="min-h-screen bg-zinc-100">

      <section className="mx-auto max-w-7xl px-6 py-14">

        <p className="text-sm font-black uppercase tracking-widest text-green-600">
          MERCANOVA GO IA
        </p>

        <h1 className="mt-3 text-5xl font-black">
          Chef Inteligente
        </h1>

        <p className="mt-4 max-w-3xl text-zinc-600">
          Escribe cualquier receta y la inteligencia artificial
          preparará automáticamente los ingredientes,
          cantidades, tiempo, valor nutricional
          y permitirá agregar todo al carrito con un solo clic.
        </p>

        <div className="mt-12">
          <ChefSearch />
        </div>

      </section>

    </main>
  );
}