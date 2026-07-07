import type { Product } from "@/types/product";
import ProductCard from "@/components/ui/ProductCard";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product, index) => (
        <div
          key={product.slug}
          className="animate-[fadeUp_0.45s_ease-out_both]"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}