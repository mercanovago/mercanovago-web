"use client";

import { useState } from "react";
import { products } from "../../data/products";
import ProductCard from "../ui/ProductCard";

interface FeaturedProductsProps {
  searchQuery: string;
}

const categories = [
  "Todos",
  "Frutas",
  "Hortalizas",
  "Tubérculos",
  "Lácteos",
  "Abarrotes",
];

const sortOptions = [
  { value: "default", label: "Destacados" },
  { value: "price-low", label: "Precio menor" },
  { value: "price-high", label: "Precio mayor" },
  { value: "az", label: "A-Z" },
];

export default function FeaturedProducts({
  searchQuery,
}: FeaturedProductsProps) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState("default");

  const query = searchQuery.trim().toLowerCase();

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.unit.toLowerCase().includes(query) ||
        product.approx.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "Todos" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "az") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <section id="catalogo" className="bg-white text-black py-14 scroll-mt-32">
      <div className="max-w-screen-2xl mx-auto px-8">
        <div className="mb-8">
          <p className="text-green-600 font-black">CATÁLOGO PREMIUM</p>

          <h2 className="text-4xl font-black">
            Productos frescos todos los días
          </h2>

          <p className="text-zinc-500 mt-2">
            Mostrando {filteredProducts.length} de {products.length} producto(s)
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-8 mb-10">
          <div className="flex flex-col gap-6">
            <div>
              <p className="font-black mb-3">Categorías</p>

              <div className="flex gap-3 overflow-x-auto pb-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-3 rounded-2xl font-black whitespace-nowrap border transition ${
                      selectedCategory === category
                        ? "bg-green-600 text-white border-green-600 shadow-md"
                        : "bg-zinc-50 text-black border-zinc-200 hover:border-green-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-black mb-3">Ordenar por</p>

              <div className="flex gap-3 overflow-x-auto pb-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-5 py-3 rounded-2xl font-black whitespace-nowrap border transition ${
                      sortBy === option.value
                        ? "bg-black text-white border-black shadow-md"
                        : "bg-zinc-50 text-black border-zinc-200 hover:border-black"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {(query || selectedCategory !== "Todos") && (
              <div className="flex flex-wrap gap-3 pt-3 border-t">
                {query && (
                  <span className="rounded-full bg-green-50 border border-green-200 px-4 py-2 font-bold text-green-700">
                    🔎 {searchQuery}
                  </span>
                )}

                {selectedCategory !== "Todos" && (
                  <button
                    onClick={() => setSelectedCategory("Todos")}
                    className="rounded-full bg-zinc-100 border border-zinc-200 px-4 py-2 font-bold"
                  >
                    {selectedCategory} ×
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 p-10 text-center">
            <h3 className="text-2xl font-black">No encontramos productos</h3>
            <p className="text-zinc-500 mt-2">
              Prueba con otra búsqueda o cambia la categoría.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}