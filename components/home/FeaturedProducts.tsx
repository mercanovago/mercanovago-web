"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types/product";
import ProductGrid from "@/components/products/ProductGrid";
import SectionTitle from "@/components/shared/SectionTitle";
import Container from "@/components/shared/Container";

type SortOption = "featured" | "price-low" | "price-high" | "az";

interface Props {
  products: Product[];
  searchQuery?: string;
}

export default function FeaturedProducts({ products, searchQuery = "" }: Props) {
  const [category, setCategory] = useState("Todos");
  const [sort, setSort] = useState<SortOption>("featured");

  const categories = [
    "Todos",
    "Frutas",
    "Hortalizas",
    "Tubérculos",
    "Lácteos",
    "Abarrotes",
  ];

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (category !== "Todos") {
      list = list.filter((p) => p.category === category);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();

      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.unit.toLowerCase().includes(query) ||
          (p.approx ?? "").toLowerCase().includes(query)
      );
    }

    switch (sort) {
      case "price-low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list.sort((a, b) => b.price - a.price);
        break;
      case "az":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "featured":
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
        break;
    }

    return list;
  }, [products, category, sort, searchQuery]);

  return (
    <section id="catalogo" className="bg-white py-10 sm:py-14 lg:py-16">
      <Container>
        <SectionTitle
          eyebrow="CATÁLOGO PREMIUM"
          title="Productos frescos todos los días"
          description={`Mostrando ${filteredProducts.length} producto(s).`}
        />

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <p className="mb-2 text-xs font-bold uppercase text-gray-500">
              Categorías
            </p>

            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    category === item
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-zinc-900 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase text-gray-500">
              Ordenar por
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                ["featured", "Destacados"],
                ["price-low", "Precio menor"],
                ["price-high", "Precio mayor"],
                ["az", "A-Z"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSort(value as SortOption)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    sort === value
                      ? "bg-black text-white"
                      : "bg-gray-100 text-zinc-900 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ProductGrid products={filteredProducts} />
      </Container>
    </section>
  );
}