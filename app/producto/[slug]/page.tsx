import { notFound } from "next/navigation";
import { products } from "../../../data/products";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-zinc-100 py-16 text-black">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-10 shadow-xl">
        <div className="grid gap-10 lg:grid-cols-2">
          <img
            src={product.image}
            alt={product.name}
            className="h-[550px] w-full rounded-3xl object-cover"
          />

          <div>
            <span className="rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white">
              {product.badge}
            </span>

            <h1 className="mt-6 text-5xl font-black">{product.name}</h1>

            <p className="mt-4 text-lg text-zinc-600">{product.description}</p>

            {product.oldPrice && (
              <p className="mt-8 text-2xl text-zinc-400 line-through">
                ${product.oldPrice.toFixed(2)}
              </p>
            )}

            <p className="text-6xl font-black text-green-600">
              ${product.price.toFixed(2)}
            </p>

            <div className="mt-8 space-y-3 text-lg">
              <p><strong>Unidad:</strong> {product.unit}</p>
              <p><strong>Presentación:</strong> {product.approx}</p>
              <p><strong>Origen:</strong> {product.origin}</p>
              <p><strong>Entrega:</strong> {product.delivery}</p>
              <p><strong>Estado:</strong> {product.stock ? "Disponible" : "Agotado"}</p>
            </div>

            <button className="mt-10 rounded-2xl bg-green-600 px-10 py-5 text-xl font-black text-white">
              🛒 Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}