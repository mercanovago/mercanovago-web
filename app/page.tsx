"use client";

import { useEffect, useState } from "react";

import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import Offers from "../components/home/Offers";
import Benefits from "../components/home/Benefits";
import About from "../components/home/About";
import Contact from "../components/home/Contact";
import Footer from "../components/layout/Footer";
import FloatingCartButton from "../components/cart/FloatingCartButton";
import CustomerSupportButton from "../components/support/CustomerSupportButton";

import { getProducts } from "@/services/products";
import type { Product } from "@/types/product";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoadingProducts(true);
        setProductsError("");

        const data = await getProducts();

        if (active) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Error al cargar productos:", error);

        if (active) {
          setProductsError(
            "No fue posible cargar el catálogo. Actualiza la página e inténtalo nuevamente."
          );
        }
      } finally {
        if (active) {
          setLoadingProducts(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <Hero />

      <Categories />

      {loadingProducts ? (
        <section className="bg-[#f5f7f5] px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

              <p className="mt-5 font-black text-zinc-700">
                Preparando el catálogo MercaNova GO...
              </p>
            </div>
          </div>
        </section>
      ) : productsError ? (
        <section className="bg-[#f5f7f5] px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[2rem] border border-red-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5" />
                  <path d="M12 17h.01" />
                </svg>
              </div>

              <h2 className="mt-5 text-2xl font-black text-zinc-950">
                Catálogo temporalmente no disponible
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-zinc-500">
                {productsError}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-2xl bg-green-600 px-7 py-4 font-black text-white transition hover:bg-green-700"
              >
                Volver a intentar
              </button>
            </div>
          </div>
        </section>
      ) : (
        <FeaturedProducts
          products={products}
          searchQuery={searchQuery}
        />
      )}

      <Offers />

      <Benefits />

      <About />

      <Contact />

      <Footer />

      <CustomerSupportButton />

      <FloatingCartButton />
    </main>
  );
}