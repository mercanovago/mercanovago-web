"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import CartDrawer from "../cart/CartDrawer";

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export default function Navbar({ searchQuery, setSearchQuery }: NavbarProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems, subtotal } = useCart();

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="leading-none">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-4xl">
                <span className="text-black">Merca</span>
                <span className="text-green-600">Nova</span>
              </h1>
              <span className="text-sm font-black italic text-green-600">
                GO
              </span>
            </Link>

            <div className="hidden items-center gap-7 text-base font-black text-zinc-700 lg:flex">
              <Link href="/" className="hover:text-green-600">
                Inicio
              </Link>

              <button className="hover:text-green-600">Categorías</button>
              <button className="hover:text-green-600">Ofertas</button>
              <button className="hover:text-green-600">Combos</button>

              <Link
                href="/chef"
                className="rounded-full bg-green-100 px-4 py-2 text-green-700 hover:bg-green-600 hover:text-white"
              >
                Chef MercaNova
              </Link>

              <button className="hover:text-green-600">Nosotros</button>
              <button className="hover:text-green-600">Contacto</button>
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="rounded-2xl bg-green-600 px-5 py-4 text-base font-black text-white shadow-lg hover:bg-green-700 lg:px-7"
            >
              <span className="hidden sm:inline">
                🛒 Mi canasta ({totalItems})
              </span>
              <span className="sm:hidden">🛒 ({totalItems})</span>
            </button>
          </div>

          <div className="mt-4 flex w-full overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-sm lg:absolute lg:left-1/2 lg:top-5 lg:mt-0 lg:w-[420px] lg:-translate-x-1/2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿Qué producto buscas?"
              className="min-w-0 flex-1 px-5 py-4 text-lg text-black outline-none lg:text-sm"
            />

            <button className="bg-green-600 px-6 py-4 text-lg font-black text-white hover:bg-green-700 lg:text-sm">
              Buscar
            </button>
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-1 lg:hidden">
            <Link
              href="/chef"
              className="whitespace-nowrap rounded-full bg-green-100 px-5 py-3 text-sm font-black text-green-700"
            >
              🍲 Chef MercaNova
            </Link>

            <Link
              href="/"
              className="whitespace-nowrap rounded-full bg-zinc-100 px-5 py-3 text-sm font-black text-zinc-700"
            >
              Inicio
            </Link>

            <button className="whitespace-nowrap rounded-full bg-zinc-100 px-5 py-3 text-sm font-black text-zinc-700">
              Categorías
            </button>

            <button className="whitespace-nowrap rounded-full bg-zinc-100 px-5 py-3 text-sm font-black text-zinc-700">
              Ofertas
            </button>
          </div>

          {totalItems > 0 && (
            <div className="mt-3 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700 lg:hidden">
              🛒 {totalItems} producto(s) en tu canasta · ${subtotal.toFixed(2)}
            </div>
          )}
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}