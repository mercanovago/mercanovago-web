import { products } from "../../data/products";
import ProductCard from "../ui/ProductCard";

export default function FeaturedProducts() {
  return (
    <section className="bg-white text-black py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-green-600 font-black">CATÁLOGO PREMIUM</p>
            <h2 className="text-4xl font-black">Productos frescos todos los días</h2>
          </div>
          <button className="border border-zinc-300 px-5 py-3 rounded-xl font-bold">
            Ver todos
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}