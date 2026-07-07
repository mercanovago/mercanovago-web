import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">

      <p className="text-sm font-black uppercase tracking-widest text-green-600">
        MercaNova GO
      </p>

      <h1 className="mt-2 text-5xl font-black">
        Panel Administrativo
      </h1>

      <p className="mt-3 text-zinc-500">
        Bienvenido al centro de administración.
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

        {/* PEDIDOS */}

        <Link
          href="/admin/orders"
          className="rounded-3xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="text-5xl">
            📦
          </div>

          <h2 className="mt-5 text-2xl font-black">
            Pedidos
          </h2>

          <p className="mt-2 text-zinc-500">
            Administrar pedidos recibidos.
          </p>
        </Link>

        {/* PRODUCTOS */}

        <Link
          href="/admin/products"
          className="rounded-3xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="text-5xl">
            🥬
          </div>

          <h2 className="mt-5 text-2xl font-black">
            Productos
          </h2>

          <p className="mt-2 text-zinc-500">
            Agregar y editar productos.
          </p>
        </Link>

        {/* CLIENTES */}

        <Link
          href="/admin/customers"
          className="rounded-3xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="text-5xl">
            👥
          </div>

          <h2 className="mt-5 text-2xl font-black">
            Clientes
          </h2>

          <p className="mt-2 text-zinc-500">
            Historial de compradores.
          </p>
        </Link>

        {/* ESTADÍSTICAS */}

        <Link
          href="/admin/stats"
          className="rounded-3xl bg-white p-8 shadow transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="text-5xl">
            📈
          </div>

          <h2 className="mt-5 text-2xl font-black">
            Estadísticas
          </h2>

          <p className="mt-2 text-zinc-500">
            Ventas y rendimiento.
          </p>
        </Link>

      </div>

    </main>
  );
}