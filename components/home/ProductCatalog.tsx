"use client";

import { useEffect, useState } from "react";

import FeaturedProducts from "./FeaturedProducts";
import { getProducts } from "@/services/products";
import type { Product } from "@/types/product";

interface Props {
  searchQuery?: string;
}

export default function ProductCatalog({
  searchQuery = "",
}: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold text-zinc-500">
          Cargando productos...
        </p>
      </div>
    );
  }

  return (
    <FeaturedProducts
      products={products}
      searchQuery={searchQuery}
    />
  );
}