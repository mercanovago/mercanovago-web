import type { Product } from "../../data/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition">
      <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
      <div className="p-4 text-black">
        <p className="text-xs font-bold text-green-600">{product.category}</p>
        <h3 className="text-xl font-black mt-1">{product.name}</h3>
        <p className="text-sm text-zinc-500">{product.unit} · {product.approx}</p>
        <div className="flex items-center justify-between mt-4">
          <p className="text-3xl font-black">${product.price.toFixed(2)}</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold">
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}