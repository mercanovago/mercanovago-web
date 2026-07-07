"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as Item, useCart } from "@/context/CartContext";

interface Props {
  item: Item;
}

export default function CartItem({ item }: Props) {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

  return (
    <article className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-zinc-100">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-black text-zinc-900">{item.name}</h3>
            <p className="text-sm text-zinc-500">{item.unit}</p>
          </div>

          <button
            type="button"
            onClick={() => removeFromCart(item.id)}
            className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center overflow-hidden rounded-2xl border border-zinc-300 bg-zinc-50">
            <button
              type="button"
              onClick={() => decreaseQuantity(item.id)}
              className="flex h-10 w-10 items-center justify-center bg-white text-zinc-900 transition hover:bg-zinc-100"
            >
              <Minus size={18} strokeWidth={3} />
            </button>

            <span className="min-w-10 text-center font-black text-zinc-900">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => increaseQuantity(item.id)}
              className="flex h-10 w-10 items-center justify-center bg-green-600 text-white transition hover:bg-green-700"
            >
              <Plus size={18} strokeWidth={3} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-xl font-black text-green-600">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500">
              ${item.price.toFixed(2)} c/u
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}