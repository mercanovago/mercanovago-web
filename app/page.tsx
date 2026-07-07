"use client";

import { useEffect, useState } from "react";

import TopBar from "../components/layout/TopBar";
import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import Offers from "../components/home/Offers";
import Benefits from "../components/home/Benefits";
import Footer from "../components/layout/Footer";
import FloatingCartButton from "../components/cart/FloatingCartButton";

import { getProducts } from "@/services/products";
import type { Product } from "@/types/product";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const data = await getProducts();
      setProducts(data);
    }

    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <TopBar />
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Hero />
      <Categories />
      <FeaturedProducts products={products} searchQuery={searchQuery} />
      <Offers />
      <Benefits />
      <Footer />
      <FloatingCartButton />
    </main>
  );
}