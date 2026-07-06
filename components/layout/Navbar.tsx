"use client";

import { useState } from "react";
import { useCart } from "../../context/CartContext";
import CartDrawer from "../cart/CartDrawer";

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export default function Navbar({ searchQuery, setSearchQuery }: NavbarProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white shadow-md">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="leading-none">
              <h1 className="text-3xl font-black sm:text-4xl">
                <span className="text-black">Merca</span>
                <span className="text-green-600">Nova</span>
              </h1>
              <span className="text-sm font-black italic text-green-600">
                GO
              </span>
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="rounded-xl bg-green-600 px-4 py-3 text-sm font-black text-white hover:bg-green-700 lg:hidden"
            >
              🛒 ({totalItems})
            </button>
          </div>

          <div className="flex w-full lg:max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿Qué producto buscas?"
              className="w-full rounded-l-xl border border-zinc-300 px-4 py-3 text-black outline-none"
            />

            <button className="rounded-r-xl bg-green-600 px-5 py-3 font-black text-white hover:bg-green-700">
              Buscar
            </button>
          </div>

          <div className="hidden gap-6 font-bold text-zinc-700 xl:flex">
            <button>Inicio</button>
            <button>Categorías</button>
            <button>Ofertas</button>
            <button>Combos</button>
            <button>Nosotros</button>
            <button>Contacto</button>
          </div>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="hidden rounded-xl bg-green-600 px-6 py-3 font-black text-white hover:bg-green-700 lg:block"
          >
            🛒 Mi canasta ({totalItems})
          </button>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}