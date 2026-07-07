"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getAdminProducts } from "@/services/adminProducts";
import ProductModal from "@/components/admin/ProductModal";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  old_price: number;
  image: string;
  unit: string;
  approx: string;
  description: string;
  stock: boolean;
  featured: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const data = await getAdminProducts();
    setProducts(data as Product[]);
    setLoading(false);
  }

  function handleNewProduct() {
    setSelectedProduct(null);
    setOpenModal(true);
  }

  function handleEditProduct(product: Product) {
    setSelectedProduct(product);
    setOpenModal(true);
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-6 sm:p-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="font-bold text-green-600 hover:underline">
          ← Volver al panel
        </Link>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-green-600">
              MercaNova GO
            </p>

            <h1 className="mt-2 text-5xl font-black">
              Administrar productos
            </h1>

            <p className="mt-3 text-zinc-500">
              Catálogo conectado directamente con Supabase.
            </p>
          </div>

          <button
            onClick={handleNewProduct}
            className="rounded-2xl bg-green-600 px-8 py-4 text-lg font-black text-white shadow-lg transition hover:bg-green-700"
          >
            + Nuevo producto
          </button>
        </div>

        {loading ? (
          <div className="mt-20 text-center">
            <div className="text-5xl">🥬</div>
            <p className="mt-6 font-bold text-zinc-500">
              Cargando productos...
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-3xl bg-white shadow-lg"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-52 w-full object-cover"
                />

                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-widest text-green-600">
                    {product.category}
                  </p>

                  <h2 className="mt-2 text-2xl font-black">{product.name}</h2>

                  <p className="mt-2 text-sm text-zinc-500">{product.unit}</p>
                  <p className="text-sm text-zinc-500">{product.approx}</p>

                  <p className="mt-4 text-4xl font-black text-green-600">
                    ${Number(product.price).toFixed(2)}
                  </p>

                  <div className="mt-6 flex gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        product.stock
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.stock ? "Disponible" : "Sin stock"}
                    </span>

                    {product.featured && (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                        Destacado
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700"
                    >
                      Editar
                    </button>

                    <button className="flex-1 rounded-xl bg-red-600 py-3 font-bold text-white hover:bg-red-700">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={loadProducts}
        product={selectedProduct}
      />
    </main>
  );
}