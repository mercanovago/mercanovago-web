"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdminGuard from "@/components/admin/AdminGuard";
import { getDashboardStats } from "@/services/adminStats";

interface Stats {
  products: number;
  customers: number;
  orders: number;
  sales: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    customers: 0,
    orders: 0,
    sales: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await getDashboardStats();
      setStats(data);
      setLoading(false);
    }

    loadStats();
  }, []);

  return (
    <AdminGuard>
      <main className="min-h-screen bg-zinc-100 p-6 sm:p-10">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin"
            className="font-bold text-green-600 hover:underline"
          >
            ← Volver al panel
          </Link>

          <div className="mb-10 mt-6">
            <p className="text-sm font-black uppercase tracking-widest text-green-600">
              MercaNova GO
            </p>

            <h1 className="mt-2 text-5xl font-black">Estadísticas</h1>

            <p className="mt-3 text-zinc-500">
              Resumen general del rendimiento comercial.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow">
              <div className="text-6xl">📊</div>
              <p className="mt-4 font-bold text-zinc-500">
                Cargando estadísticas...
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-white p-8 shadow">
                <div className="text-5xl">💰</div>
                <p className="mt-5 text-sm font-black uppercase text-zinc-500">
                  Total ventas
                </p>
                <h2 className="mt-2 text-4xl font-black text-green-600">
                  ${stats.sales.toFixed(2)}
                </h2>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow">
                <div className="text-5xl">📦</div>
                <p className="mt-5 text-sm font-black uppercase text-zinc-500">
                  Pedidos
                </p>
                <h2 className="mt-2 text-4xl font-black">{stats.orders}</h2>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow">
                <div className="text-5xl">👥</div>
                <p className="mt-5 text-sm font-black uppercase text-zinc-500">
                  Clientes
                </p>
                <h2 className="mt-2 text-4xl font-black">{stats.customers}</h2>
              </div>

              <div className="rounded-3xl bg-white p-8 shadow">
                <div className="text-5xl">🥬</div>
                <p className="mt-5 text-sm font-black uppercase text-zinc-500">
                  Productos
                </p>
                <h2 className="mt-2 text-4xl font-black">{stats.products}</h2>
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}