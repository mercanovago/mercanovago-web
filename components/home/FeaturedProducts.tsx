"use client";

import { useMemo, useState } from "react";

import Container from "@/components/shared/Container";
import ProductGrid from "@/components/products/ProductGrid";
import SectionTitle from "@/components/shared/SectionTitle";
import type { Product } from "@/types/product";

type SortOption = "featured" | "price-low" | "price-high" | "az";

interface Props {
  products: Product[];
  searchQuery?: string;
}

const categories = [
  "Todos",
  "Frutas",
  "Hortalizas",
  "Tubérculos",
  "Lácteos",
  "Abarrotes",
];

const sortOptions: Array<{
  value: SortOption;
  label: string;
}> = [
  {
    value: "featured",
    label: "Destacados",
  },
  {
    value: "price-low",
    label: "Menor precio",
  },
  {
    value: "price-high",
    label: "Mayor precio",
  },
  {
    value: "az",
    label: "Nombre A–Z",
  },
];

export default function FeaturedProducts({
  products,
  searchQuery = "",
}: Props) {
  const [category, setCategory] = useState("Todos");
  const [sort, setSort] = useState<SortOption>("featured");

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (category !== "Todos") {
      list = list.filter(
        (product) =>
          product.category.toLowerCase().trim() ===
          category.toLowerCase().trim()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      list = list.filter((product) => {
        const searchableText = [
          product.name,
          product.category,
          product.unit,
          product.approx ?? "",
          product.description ?? "",
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    switch (sort) {
      case "price-low":
        list.sort((a, b) => Number(a.price) - Number(b.price));
        break;

      case "price-high":
        list.sort((a, b) => Number(b.price) - Number(a.price));
        break;

      case "az":
        list.sort((a, b) =>
          a.name.localeCompare(b.name, "es", {
            sensitivity: "base",
          })
        );
        break;

      case "featured":
      default:
        list.sort((a, b) => {
          const featuredDifference =
            Number(Boolean(b.featured)) - Number(Boolean(a.featured));

          if (featuredDifference !== 0) {
            return featuredDifference;
          }

          return a.name.localeCompare(b.name, "es", {
            sensitivity: "base",
          });
        });
        break;
    }

    return list;
  }, [products, category, sort, searchQuery]);

  const featuredCount = useMemo(
    () => products.filter((product) => product.featured).length,
    [products]
  );

  const availableCount = useMemo(
    () => products.filter((product) => product.stock).length,
    [products]
  );

  function clearFilters() {
    setCategory("Todos");
    setSort("featured");
  }

  const hasActiveFilters =
    category !== "Todos" ||
    sort !== "featured" ||
    searchQuery.trim().length > 0;

  return (
    <section
      id="catalogo"
      className="relative overflow-hidden bg-[#f5f7f5] py-14 text-zinc-950 sm:py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-green-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-16 h-80 w-80 rounded-full bg-green-100/50 blur-3xl" />

      <Container>
        <div className="relative">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <SectionTitle
              eyebrow="CATÁLOGO MERCANOVA GO"
              title="Productos frescos para cada momento"
              description="Encuentra alimentos seleccionados, precios claros y una experiencia de compra rápida, confiable y organizada."
            />

            <div className="grid grid-cols-3 gap-3 sm:min-w-[430px]">
              <div className="rounded-3xl border border-white bg-white/90 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Catálogo
                </p>

                <p className="mt-2 text-2xl font-black text-zinc-950">
                  {products.length}
                </p>

                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  productos
                </p>
              </div>

              <div className="rounded-3xl border border-white bg-white/90 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Disponibles
                </p>

                <p className="mt-2 text-2xl font-black text-green-600">
                  {availableCount}
                </p>

                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  en stock
                </p>
              </div>

              <div className="rounded-3xl border border-white bg-white/90 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Selección
                </p>

                <p className="mt-2 text-2xl font-black text-zinc-950">
                  {featuredCount}
                </p>

                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  destacados
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
            <div className="border-b border-zinc-200 bg-zinc-950 px-5 py-5 text-white sm:px-7">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-green-400">
                    Explora el catálogo
                  </p>

                  <p className="mt-1 text-sm font-semibold text-zinc-300">
                    Mostrando {filteredProducts.length} de {products.length}{" "}
                    producto(s)
                  </p>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-black text-white transition hover:bg-white hover:text-zinc-950"
                  >
                    Restablecer filtros
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-8 p-5 sm:p-7 xl:grid-cols-[1fr_auto] xl:items-end">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                      Categorías
                    </p>

                    <p className="mt-1 text-sm font-semibold text-zinc-600">
                      Elige el grupo de productos que necesitas.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {categories.map((item) => {
                    const active = category === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCategory(item)}
                        aria-pressed={active}
                        className={`whitespace-nowrap rounded-full border px-5 py-3 text-sm font-black transition ${
                          active
                            ? "border-green-600 bg-green-600 text-white shadow-lg shadow-green-600/20"
                            : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="xl:min-w-[230px]">
                <label
                  htmlFor="product-sort"
                  className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400"
                >
                  Ordenar catálogo
                </label>

                <div className="relative mt-3">
                  <select
                    id="product-sort"
                    value={sort}
                    onChange={(event) =>
                      setSort(event.target.value as SortOption)
                    }
                    className="w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 pr-12 text-sm font-black text-zinc-900 outline-none transition focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-100"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m7 10 5 5 5-5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>
                </div>

                <h3 className="mt-5 text-2xl font-black text-zinc-950">
                  No encontramos productos
                </h3>

                <p className="mx-auto mt-2 max-w-md text-zinc-500">
                  Prueba con otra categoría, modifica tu búsqueda o restablece
                  los filtros del catálogo.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-2xl bg-green-600 px-7 py-4 font-black text-white transition hover:bg-green-700"
                >
                  Mostrar todo el catálogo
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}