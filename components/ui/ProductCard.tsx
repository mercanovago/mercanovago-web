"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import Badge from "../shared/Badge";
import Button from "../shared/Button";
import Price from "../shared/Price";
import StockBadge from "../shared/StockBadge";
import DeliveryBadge from "../shared/DeliveryBadge";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      unit: product.unit,
    });
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:border-green-300 hover:shadow-2xl active:scale-[0.98] sm:rounded-[28px]">
      <div className="relative">
        <Link href={`/producto/${product.slug}`}>
          <div className="relative h-36 overflow-hidden bg-zinc-100 sm:h-56 lg:h-64">
            <img
              src={product.image}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = "/hero-market.jpg";
              }}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          </div>
        </Link>

        <div className="absolute left-2 top-2 sm:left-4 sm:top-4">
          <Badge
            variant="success"
            className="px-2 py-1 text-[10px] sm:px-3 sm:text-xs"
          >
            {product.badge ?? "Fresh Day"}
          </Badge>
        </div>

        <button
          type="button"
          aria-label="Agregar a favoritos"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-base shadow-md backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-white hover:text-red-500 sm:right-4 sm:top-4 sm:h-10 sm:w-10 sm:text-xl"
        >
          ♡
        </button>
      </div>

      <div className="p-3 sm:p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-black uppercase tracking-wide text-green-600 sm:text-xs">
            {product.category}
          </p>

          <div className="hidden sm:block">
            <StockBadge stock={product.stock} />
          </div>
        </div>

        <Link href={`/producto/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[40px] text-base font-black leading-tight text-zinc-950 transition-colors duration-300 hover:text-green-600 sm:min-h-[58px] sm:text-2xl">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 text-xs font-medium text-zinc-500 sm:mt-2 sm:text-sm">
          {product.unit} · {product.approx ?? ""}
        </p>

        <div className="mt-2 hidden sm:block">
          <DeliveryBadge delivery={product.delivery ?? "20-25 min"} />
        </div>

        <div className="mt-3 sm:mt-5">
          <Price
            price={product.price}
            oldPrice={product.old_price ?? undefined}
            size="sm"
          />
        </div>

        <Button
          type="button"
          fullWidth
          disabled={!product.stock}
          onClick={handleAdd}
          className="mt-3 py-2 text-xs shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:mt-5 sm:py-4 sm:text-lg"
        >
          🛒 Agregar
        </Button>
      </div>
    </article>
  );
}