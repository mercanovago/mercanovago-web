"use client";

import { products } from "../../data/products";
import ProductCard from "../ui/ProductCard";

interface FeaturedProductsProps {
  searchQuery: string;
}

export default function FeaturedProducts({
  searchQuery,
}: FeaturedProductsProps) {
  const query = searchQuery.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    if (!query) return true;

    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.unit.toLowerCase().includes(query) ||
      product.approx.toLowerCase().includes(query)
    );
  });

  return (
    <section
      id="catalogo"
      className="bg-white text-black py-10 scroll-mt-32"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-green-600 font-black">CATÁLOGO PREMIUM</p>

            <h2 className="text-4xl font-black">
              Productos frescos todos los días
            </h2>

            {query && (
              <p className="text-zinc-500 mt-2">
                Resultados para: <strong>{searchQuery}</strong> ·{" "}
                {filteredProducts.length} producto(s)
              </p>
            )}
          </div>

          <button className="border border-zinc-300 px-5 py-3 rounded-xl font-bold">
            Ver todos
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 p-10 text-center">
            <h3 className="text-2xl font-black">
              No encontramos productos
            </h3>
            <p className="text-zinc-500 mt-2">
              Intenta buscar con otro nombre o categoría.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}