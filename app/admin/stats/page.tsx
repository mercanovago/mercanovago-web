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
  averageTicket: number;
  pending: number;
  preparing: number;
  onWay: number;
  delivered: number;
  cancelled: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    customers: 0,
    orders: 0,
    sales: 0,
    averageTicket: 0,
    pending: 0,
    preparing: 0,
    onWay: 0,
    delivered: 0,
    cancelled: 0,
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

  const cards = [
    {
      title: "Total ventas",
      value: `$${stats.sales.toFixed(2)}`,
      icon: "💰",
      color: "text-green-600",
    },
    {
      title: "Pedidos",
      value: stats.orders,
      icon: "📦",
      color: "text-zinc-900",
    },
    {
      title: "Clientes",
      value: stats.customers,
      icon: "👥",
      color: "text-zinc-900",
    },
    {
      title: "Productos",
      value: stats.products,
      icon: "🥬",
      color: "text-zinc-900",
    },
    {
      title: "Ticket promedio",
      value: `$${stats.averageTicket.toFixed(2)}`,
      icon: "🧾",
      color: "text-green-600",
    },
    {
      title: "Pendientes",
      value: stats.pending,
      icon: "🟡",
      color: "text-yellow-600",
    },
    {
      title: "Preparando",
      value: stats.preparing,
      icon: "👨‍🍳",
      color: "text-orange-600",
    },
    {
      title: "En camino",
      value: stats.onWay,
      icon: "🚚",
      color: "text-blue-600",
    },
    {
      title: "Entregados",
      value: stats.delivered,
      icon: "✅",
      color: "text-green-600",
    },
    {
      title: "Cancelados",
      value: stats.cancelled,
      icon: "❌",
      color: "text-red-600",
    },
  ];

  return (
    <AdminGuard>
      <main className="min-h-screen bg-zinc-100 p-6 sm:p-10">
        <div className="mx-auto max-w-7xl">
          <Link href="/admin" className="font-bold text-green-600 hover:underline">
            ← Volver al panel
          </Link>

          <div className="mb-10 mt-6">
            <p className="text-sm font-black uppercase tracking-widest text-green-600">
              MercaNova GO 7.5
            </p>

            <h1 className="mt-2 text-5xl font-black">
              Estadísticas Premium
            </h1>

            <p className="mt-3 text-zinc-500">
              Resumen ejecutivo de ventas, pedidos, clientes y operación.
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
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
              {cards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-3xl bg-white p-7 shadow transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="text-5xl">{card.icon}</div>

                  <p className="mt-5 text-xs font-black uppercase tracking-widest text-zinc-500">
                    {card.title}
                  </p>

                  <h2 className={`mt-2 text-4xl font-black ${card.color}`}>
                    {card.value}
                  </h2>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}