"use client";

import { useCart } from "@/context/CartContext";
import CartItem from "./CartItem";
import EmptyCart from "./EmptyCart";
import CartSummary from "./CartSummary";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { cart, subtotal, totalItems, clearCart } = useCart();

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />

      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-zinc-200 p-6">
          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              Mi canasta
            </h2>
            <p className="text-sm text-zinc-500">
              {totalItems} producto(s)
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-xl font-black text-zinc-700 hover:bg-zinc-200"
          >
            ×
          </button>
        </header>

        {cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {cart.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}

              <button
                onClick={clearCart}
                className="mt-4 w-full rounded-2xl border border-zinc-200 py-3 font-bold text-zinc-600 hover:bg-zinc-100"
              >
                Vaciar canasta
              </button>
            </div>

            <CartSummary subtotal={subtotal} totalItems={totalItems} />
          </>
        )}
      </aside>
    </>
  );
}