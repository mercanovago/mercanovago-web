"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "../../data/products";
import { useCart } from "../../context/CartContext";
import FloatingCartButton from "../cart/FloatingCartButton";

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      unit: product.unit,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-6 sm:py-10 lg:py-16 text-black">
      <div className="mx-auto w-full max-w-6xl rounded-3xl bg-white p-5 sm:p-8 lg:p-10 shadow-xl">
        <Link href="/" className="font-bold text-green-600 text-sm sm:text-base">
          ← Volver al catálogo
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <img
            src={product.image}
            alt={product.name}
            className="h-72 sm:h-96 lg:h-[550px] w-full rounded-3xl object-cover"
          />

          <div>
            <span className="rounded-full bg-green-600 px-4 py-2 text-xs sm:text-sm font-bold text-white">
              {product.badge}
            </span>

            <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
              {product.name}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-zinc-600">
              {product.description}
            </p>

            {product.oldPrice && (
              <p className="mt-6 text-xl sm:text-2xl text-zinc-400 line-through">
                ${product.oldPrice.toFixed(2)}
              </p>
            )}

            <p className="text-5xl sm:text-6xl font-black text-green-600">
              ${product.price.toFixed(2)}
            </p>

            <div className="mt-6 space-y-3 text-base sm:text-lg">
              <p><strong>Unidad:</strong> {product.unit}</p>
              <p><strong>Presentación:</strong> {product.approx}</p>
              <p><strong>Origen:</strong> {product.origin}</p>
              <p><strong>Entrega:</strong> {product.delivery}</p>
              <p><strong>Estado:</strong> {product.stock ? "Disponible" : "Agotado"}</p>
            </div>

            <button
              type="button"
              disabled={!product.stock}
              onClick={handleAddToCart}
              className="mt-8 w-full sm:w-auto rounded-2xl bg-green-600 px-8 py-4 sm:px-10 sm:py-5 text-lg sm:text-xl font-black text-white hover:bg-green-700 disabled:bg-zinc-300"
            >
              {added ? "✅ Agregado a la canasta" : "🛒 Agregar al carrito"}
            </button>
          </div>
        </div>
      </div>

      <FloatingCartButton />
    </main>
  );
}