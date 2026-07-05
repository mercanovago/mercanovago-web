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

  const handleSearch = (value: string) => {
    setSearchQuery(value);

    setTimeout(() => {
      document
        .getElementById("catalogo")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black">
              <span className="text-black">Merca</span>
              <span className="text-green-600">Nova</span>
            </h1>
            <span className="text-green-600 font-bold italic">GO</span>
          </div>

          <div className="flex-1 hidden lg:flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="¿Qué producto estás buscando?"
              className="w-full rounded-l-xl border border-zinc-300 px-5 py-3 outline-none text-black"
            />

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("catalogo")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-r-xl font-bold"
            >
              Buscar
            </button>
          </div>

          <div className="hidden xl:flex gap-8 font-semibold text-zinc-700">
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
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold"
          >
            🛒 Mi canasta ({totalItems})
          </button>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}