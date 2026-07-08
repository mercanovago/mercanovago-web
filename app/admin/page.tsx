"use client";

import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminPage() {
  const modules = [
    {
      title: "Pedidos",
      description: "Administrar pedidos realizados por los clientes.",
      href: "/admin/orders",
      icon: "📦",
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Productos",
      description: "Crear, editar y administrar el catálogo completo.",
      href: "/admin/products",
      icon: "🥬",
      color: "from-lime-500 to-green-600",
    },
    {
      title: "Clientes",
      description: "Consultar y administrar clientes registrados.",
      href: "/admin/customers",
      icon: "👥",
      color: "from-blue-500 to-cyan-600",
    },
    {
      title: "Estadísticas",
      description: "Visualizar ventas, pedidos y rendimiento.",
      href: "/admin/stats",
      icon: "📊",
      color: "from-purple-500 to-fuchsia-600",
    },
  ];

  return (
    <AdminGuard>
      <main className="min-h-screen bg-zinc-100">
        <section className="mx-auto max-w-7xl px-8 py-14">
          {/* Encabezado */}

          <div className="mb-12">
            <p className="text-sm font-black uppercase tracking-widest text-green-600">
              MERCANOVA GO
            </p>

            <h1 className="mt-2 text-5xl font-black text-zinc-900">
              Panel Administrativo
            </h1>

            <p className="mt-4 max-w-3xl text-lg text-zinc-500">
              Bienvenido al centro de control de MercaNova GO.
              Desde aquí podrás administrar toda la operación de la
              plataforma.
            </p>
          </div>

          {/* Tarjetas */}

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="group overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div
                  className={`h-2 bg-gradient-to-r ${module.color}`}
                />

                <div className="p-8">
                  <div className="text-6xl transition duration-300 group-hover:scale-110">
                    {module.icon}
                  </div>

                  <h2 className="mt-6 text-3xl font-black">
                    {module.title}
                  </h2>

                  <p className="mt-3 text-zinc-500">
                    {module.description}
                  </p>

                  <div className="mt-8 flex items-center gap-2 font-black text-green-600">
                    Ingresar
                    <span className="transition-transform duration-300 group-hover:translate-x-2">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Estado */}

          <div className="mt-14 rounded-3xl bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black">
                Estado del sistema
              </h3>

              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-700">
                ● En línea
              </span>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-4">
              <div className="rounded-2xl bg-zinc-100 p-6">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Plataforma
                </p>

                <h4 className="mt-3 text-2xl font-black text-green-600">
                  Operativa
                </h4>
              </div>

              <div className="rounded-2xl bg-zinc-100 p-6">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Base de datos
                </p>

                <h4 className="mt-3 text-2xl font-black text-green-600">
                  Supabase
                </h4>
              </div>

              <div className="rounded-2xl bg-zinc-100 p-6">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Framework
                </p>

                <h4 className="mt-3 text-2xl font-black text-green-600">
                  Next.js 16
                </h4>
              </div>

              <div className="rounded-2xl bg-zinc-100 p-6">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Versión
                </p>

                <h4 className="mt-3 text-2xl font-black text-green-600">
                  MercaNova GO 7.4
                </h4>
              </div>
            </div>
          </div>

          {/* Pie */}

          <div className="mt-12 text-center text-sm text-zinc-500">
            © 2026 MercaNova GO · Panel Administrativo Premium
          </div>
        </section>
      </main>
    </AdminGuard>
  );
}