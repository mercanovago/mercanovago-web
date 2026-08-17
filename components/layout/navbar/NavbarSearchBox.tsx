"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { Product } from "@/types/product";
import {
  createProductFallbackImage,
  getProductImage,
} from "@/lib/productImages";

interface NavbarSearchBoxProps {
  id: string;
  products: Product[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSearch: () => void;
  mobile?: boolean;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function NavbarSearchBox({
  id,
  products,
  searchQuery,
  setSearchQuery,
  onSearch,
  mobile = false,
}: NavbarSearchBoxProps) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [focused, setFocused] = useState(false);

  const normalizedQuery = normalizeSearchText(searchQuery);

  const suggestions = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return [];
    }

    return products
      .map((product) => {
        const searchableText = normalizeSearchText(
          [
            product.name,
            product.category,
            product.unit,
            product.approx ?? "",
            product.description ?? "",
          ].join(" ")
        );

        const normalizedName = normalizeSearchText(product.name);
        const normalizedCategory = normalizeSearchText(product.category);

        let score = 0;

        if (normalizedName === normalizedQuery) {
          score += 100;
        } else if (normalizedName.startsWith(normalizedQuery)) {
          score += 70;
        } else if (normalizedName.includes(normalizedQuery)) {
          score += 50;
        }

        if (normalizedCategory.startsWith(normalizedQuery)) {
          score += 25;
        } else if (normalizedCategory.includes(normalizedQuery)) {
          score += 15;
        }

        if (searchableText.includes(normalizedQuery)) {
          score += 10;
        }

        return {
          product,
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.product.name.localeCompare(b.product.name, "es", {
          sensitivity: "base",
        });
      })
      .slice(0, 6)
      .map((item) => item.product);
  }, [normalizedQuery, products]);

  const showSuggestions =
    focused && normalizedQuery.length >= 2;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target)
      ) {
        setFocused(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFocused(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFocused(false);
    onSearch();
  }

  function handleSelectProduct(product: Product) {
    setFocused(false);
    setSearchQuery(product.name);
    router.push(`/producto/${product.slug}`);
  }

  return (
    <div
      ref={wrapperRef}
      className={`relative min-w-0 ${
        mobile
          ? "mb-3 w-full lg:hidden"
          : "hidden min-w-0 flex-1 lg:block 2xl:max-w-[330px]"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className="flex overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm transition focus-within:border-green-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-100"
      >
        <label htmlFor={id} className="sr-only">
          Buscar productos
        </label>

        <div className="flex min-w-0 flex-1 items-center">
          <svg
            viewBox="0 0 24 24"
            className="ml-4 h-5 w-5 shrink-0 text-zinc-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>

          <input
            id={id}
            type="search"
            value={searchQuery}
            onFocus={() => setFocused(true)}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setFocused(true);
            }}
            autoComplete="off"
            placeholder={
              mobile
                ? "Buscar productos"
                : "Busca frutas, tubérculos, lácteos..."
            }
            className={`min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-zinc-950 outline-none placeholder:font-medium placeholder:text-zinc-400 ${
              mobile ? "py-3.5" : "py-3"
            }`}
          />
        </div>

        <button
          type="submit"
          className="shrink-0 bg-green-600 px-4 text-sm font-black text-white transition hover:bg-green-700 xl:px-5"
        >
          Buscar
        </button>
      </form>

      {showSuggestions && (
        <div className="absolute inset-x-0 top-[calc(100%+0.65rem)] z-[80] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
          <div className="border-b border-zinc-100 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-green-600">
              Sugerencias del catálogo
            </p>
          </div>

          {suggestions.length > 0 ? (
            <div className="max-h-[420px] overflow-y-auto p-2">
              {suggestions.map((product) => {
                const productImage =
                  getProductImage(product) ||
                  createProductFallbackImage(
                    product.name,
                    product.category
                  );

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() =>
                      handleSelectProduct(product)
                    }
                    className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-green-50"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                      <img
                        src={productImage}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-zinc-950">
                        {product.name}
                      </p>

                      <p className="mt-1 truncate text-xs font-bold text-green-600">
                        {product.category}
                      </p>

                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {product.unit}
                        {product.approx
                          ? ` · ${product.approx}`
                          : ""}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-base font-black text-zinc-950">
                        ${Number(product.price).toFixed(2)}
                      </p>

                      <p
                        className={`mt-1 text-[10px] font-black uppercase tracking-wider ${
                          product.stock
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {product.stock
                          ? "Disponible"
                          : "Agotado"}
                      </p>
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setFocused(false);
                  onSearch();
                }}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-green-600"
              >
                Ver todos los resultados

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
              </button>
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </div>

              <p className="mt-4 text-sm font-black text-zinc-950">
                No encontramos coincidencias
              </p>

              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                Prueba con otro nombre, categoría o presentación.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}