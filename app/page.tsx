import TopBar from "../components/layout/TopBar";
import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import FeaturedProducts from "../components/home/FeaturedProducts";
import Offers from "../components/home/Offers";
import Benefits from "../components/home/Benefits";
import Footer from "../components/layout/Footer";
import FloatingCartButton from "../components/cart/FloatingCartButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <TopBar />
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Offers />
      <Benefits />
      <Footer />
      <FloatingCartButton />
    </main>
  );
}