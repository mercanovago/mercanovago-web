import Link from "next/link";

interface Props {
  subtotal: number;
  totalItems: number;
}

export default function CartSummary({ subtotal, totalItems }: Props) {
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="border-t border-zinc-200 bg-white p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
      <div className="mb-5 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
        🎉 Envío gratis disponible para Riobamba y sectores cercanos.
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Productos</span>
          <span className="font-black text-zinc-900">{totalItems}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Subtotal</span>
          <span className="font-black text-zinc-900">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-500">Costo de envío</span>
          <span className="font-black text-green-600">Gratis</span>
        </div>
      </div>

      <div className="my-5 border-t border-dashed border-zinc-300" />

      <div className="mb-6 flex items-center justify-between">
        <span className="text-xl font-black text-zinc-950">Total</span>
        <span className="text-4xl font-black text-green-600">
          ${total.toFixed(2)}
        </span>
      </div>

      <Link
        href="/checkout"
        className="block w-full rounded-2xl bg-green-600 py-4 text-center text-lg font-black text-white shadow-lg transition hover:bg-green-700 active:scale-95"
      >
        Continuar compra →
      </Link>
    </div>
  );
}