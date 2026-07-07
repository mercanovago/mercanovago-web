import Link from "next/link";
import Button from "../shared/Button";

export default function EmptyCart() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">

      <div className="mb-6 text-7xl">
        🛒
      </div>

      <h2 className="text-3xl font-black text-zinc-900">
        Tu canasta está vacía
      </h2>

      <p className="mt-4 max-w-sm text-zinc-500">
        Agrega frutas, verduras, lácteos y más productos para comenzar tu compra.
      </p>

      <Link href="/#catalogo" className="mt-8 w-full">
        <Button fullWidth>
          Explorar productos
        </Button>
      </Link>

    </div>
  );
}