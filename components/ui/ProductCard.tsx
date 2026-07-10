"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import {
  createProductFallbackImage,
  getProductImage,
} from "@/lib/productImages";

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();

  const [added, setAdded] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [imageHasFailed, setImageHasFailed] = useState(false);

  const currentPrice = Number(product.price ?? 0);
  const oldPrice = Number(product.old_price ?? 0);

  const hasDiscount =
    oldPrice > currentPrice && oldPrice > 0;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((oldPrice - currentPrice) / oldPrice) * 100
      )
    : 0;

  const fallbackImage = useMemo(
    () =>
      createProductFallbackImage(
        product.name,
        product.category
      ),
    [product.name, product.category]
  );

  const initialProductImage = useMemo(
    () => getProductImage(product),
    [product]
  );

  const displayedImage = imageHasFailed
    ? fallbackImage
    : initialProductImage;

  function handleAddToCart() {
    if (!product.stock) {
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      image: displayedImage,
      price: currentPrice,
      unit: product.unit,
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1800);
  }

  function handleFavorite() {
    setFavorite((current) => !current);
  }

  function handleImageError() {
    if (!imageHasFailed) {
      setImageHasFailed(true);
    }
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-zinc-200 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition duration-500 hover:-translate-y-2 hover:border-green-300 hover:shadow-[0_24px_65px_rgba(15,23,42,0.14)]">
      <div className="relative overflow-hidden bg-[#f4f7f4]">
        <Link
          href={`/producto/${product.slug}`}
          aria-label={`Ver ${product.name}`}
          className="block"
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={displayedImage}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onError={handleImageError}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.07]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
          </div>
        </Link>

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.featured && (
            <span className="rounded-full bg-zinc-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
              Selección MercaNova
            </span>
          )}

          {hasDiscount && (
            <span className="rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
              -{discountPercentage}%
            </span>
          )}

          {!product.featured && !hasDiscount && (
            <span className="rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-green-700 shadow backdrop-blur">
              Fresco
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleFavorite}
          aria-label={
            favorite
              ? `Quitar ${product.name} de favoritos`
              : `Agregar ${product.name} a favoritos`
          }
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border shadow-lg backdrop-blur transition duration-300 hover:scale-110 ${
            favorite
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-white/70 bg-white/90 text-zinc-700 hover:text-red-500"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill={favorite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </button>

        <div className="absolute bottom-3 left-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow backdrop-blur ${
              product.stock
                ? "border-green-200 bg-green-50/95 text-green-700"
                : "border-red-200 bg-red-50/95 text-red-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                product.stock
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />

            {product.stock ? "Disponible" : "Agotado"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-600 sm:text-xs">
              {product.category}
            </p>

            <Link href={`/producto/${product.slug}`}>
              <h3 className="mt-2 line-clamp-2 min-h-[44px] text-lg font-black leading-tight text-zinc-950 transition hover:text-green-700 sm:min-h-[52px] sm:text-xl">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M20 12v8H4v-8" />
              <path d="M2 7h20v5H2z" />
              <path d="M12 7v13" />
              <path d="M12 7H7.5A2.5 2.5 0 1 1 10 4.5V7Z" />
              <path d="M12 7h4.5A2.5 2.5 0 1 0 14 4.5V7Z" />
            </svg>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm font-medium leading-relaxed text-zinc-500">
          {product.unit}
          {product.approx ? ` · ${product.approx}` : ""}
        </p>

        {product.description && (
          <p className="mt-2 line-clamp-2 hidden text-sm leading-relaxed text-zinc-500 sm:block">
            {product.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-zinc-500">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M3 6h13v11H3z" />
            <path d="M16 10h3l2 3v4h-5z" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="18" cy="18" r="2" />
          </svg>

          <span>
            {product.delivery ??
              "Entrega estimada 20–30 min"}
          </span>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              {hasDiscount && (
                <p className="text-sm font-bold text-zinc-400 line-through">
                  ${oldPrice.toFixed(2)}
                </p>
              )}

              <div className="flex items-end gap-1">
                <span className="text-3xl font-black tracking-tight text-zinc-950">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>

              <p className="mt-1 text-[11px] font-bold text-zinc-400">
                Precio final
              </p>
            </div>

            {product.featured && (
              <div className="rounded-2xl bg-green-50 px-3 py-2 text-right">
                <p className="text-[9px] font-black uppercase tracking-wider text-green-700">
                  Recomendado
                </p>

                <p className="mt-0.5 text-xs font-black text-green-600">
                  MercaNova GO
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!product.stock}
            onClick={handleAddToCart}
            className={`mt-5 flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-black transition duration-300 sm:text-base ${
              !product.stock
                ? "cursor-not-allowed bg-zinc-200 text-zinc-500"
                : added
                  ? "bg-green-100 text-green-700"
                  : "bg-zinc-950 text-white shadow-lg hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-xl"
            }`}
          >
            {added ? (
              <>
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>

                Agregado a tu canasta
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="9" cy="20" r="1" />
                  <circle cx="19" cy="20" r="1" />
                  <path d="M3 4h2l2.5 11h11l2-7H7" />
                  <path d="M12 8v5" />
                  <path d="M9.5 10.5h5" />
                </svg>

                {product.stock
                  ? "Agregar a mi canasta"
                  : "Producto agotado"}
              </>
            )}
          </button>

          <Link
            href={`/producto/${product.slug}`}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 px-5 py-3 text-sm font-black text-zinc-700 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
          >
            Ver detalles

            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}