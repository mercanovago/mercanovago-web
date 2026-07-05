"use client";

import Link from "next/link";
import type { Product } from "../../data/products";
import { useCart } from "../../context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <article className="group bg-white rounded-[28px] overflow-hidden border border-zinc-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <Link href={`/producto/${product.slug}`}>
        <div className="relative h-64 overflow-hidden bg-zinc-100 cursor-pointer">
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src = "/hero-market.jpg";
            }}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
          />

          <span className="absolute left-4 top-4 rounded-full bg-green-600 px-3 py-1 text-xs font-black text-white shadow-md">
            {product.badge}
          </span>

          {product.featured && (
            <span className="absolute right-4 top-4 rounded-full bg-black/80 px-3 py-1 text-xs font-black text-white">
              ⭐ Destacado
            </span>
          )}
        </div>
      </Link>

      <div className="p-5 text-black">
        <p className="text-xs font-black uppercase tracking-wide text-green-600">
          {product.category}
        </p>

        <Link href={`/producto/${product.slug}`}>
          <h3 className="mt-1 text-2xl font-black leading-tight hover:text-green-600 cursor-pointer">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 text-sm text-zinc-500">
          {product.unit} · {product.approx}
        </p>

        <p className="mt-2 text-xs font-bold text-zinc-500">
          🚚 Entrega estimada: {product.delivery}
        </p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            {product.oldPrice && (
              <p className="text-sm font-bold text-zinc-400 line-through">
                ${product.oldPrice.toFixed(2)}
              </p>
            )}

            <p className="text-4xl font-black text-zinc-950">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${
              product.stock
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {product.stock ? "Disponible" : "Agotado"}
          </span>
        </div>

        <button
          type="button"
          disabled={!product.stock}
          onClick={() =>
            addToCart({
              id: product.id,
              name: product.name,
              image: product.image,
              price: product.price,
              unit: product.unit,
            })
          }
          className="mt-5 w-full rounded-2xl bg-green-600 px-5 py-4 text-lg font-black text-white transition hover:bg-green-700 active:scale-95 disabled:bg-zinc-300 disabled:cursor-not-allowed"
        >
          🛒 Agregar
        </button>
      </div>
    </article>
  );
}