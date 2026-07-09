"use client";

import { CartProvider } from "@/components/cart/CartContext";
import ChefSearch from "@/components/chef/ChefSearch";

export default function ChefPage() {
  return (
    <CartProvider>
      <main className="min-h-screen bg-zinc-100">
        <section className="mx-auto max-w-7xl px-6 py-14">
          <p className="text-sm font-black uppercase tracking-widest text-green-600">
            MERCANOVA CHEF
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Chef Inteligente
          </h1>

          <p className="mt-4 max-w-3xl text-zinc-600">
            Cuéntanos qué quieres preparar y MercaNova GO te ayuda a encontrar
            los ingredientes perfectos, calcular el costo aproximado y llevar
            todo directo a tu canasta en segundos.
          </p>

          <div className="mt-12">
            <ChefSearch />
          </div>
        </section>
      </main>
    </CartProvider>
  );
}