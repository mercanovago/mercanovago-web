"use client";

import { useState } from "react";
import { useCart } from "../../context/CartContext";
import CartDrawer from "./CartDrawer";

export default function FloatingCartButton() {
  const [open, setOpen] = useState(false);
  const { totalItems, subtotal } = useCart();

  if (totalItems === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl px-6 py-4 font-black flex items-center gap-3 transition hover:scale-105"
      >
        <span className="text-2xl">🛒</span>

        <span>
          Mi canasta ({totalItems}) · ${subtotal.toFixed(2)}
        </span>
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}