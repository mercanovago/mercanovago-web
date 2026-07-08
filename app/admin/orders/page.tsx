"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AdminGuard from "@/components/admin/AdminGuard";
import { getAdminOrders } from "@/services/adminOrders";
import { updateOrderStatus } from "@/services/updateOrderStatus";

const statusOptions = [
  "Todos",
  "Pendiente",
  "Preparando",
  "En camino",
  "Entregado",
  "Cancelado",
];

const editableStatus = [
  "Pendiente",
  "Preparando",
  "En camino",
  "Entregado",
  "Cancelado",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("Todos");

  async function loadOrders() {
    setLoading(true);
    const data = await getAdminOrders();
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (selectedStatus === "Todos") return orders;
    return orders.filter((order) => order.status === selectedStatus);
  }, [orders, selectedStatus]);

  const totalSales = orders.reduce(
    (sum, order) => sum + Number(order.total ?? 0),
    0
  );

  const pendingCount = orders.filter(
    (order) => order.status === "Pendiente"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "Entregado"
  ).length;

  async function handleStatusChange(orderId: number, status: string) {
    await updateOrderStatus(orderId, status);

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-zinc-100 p-6 sm:p-10">
        <div className="mx-auto max-w-7xl">
          <Link href="/admin" className="font-bold text-green-600">
            ← Volver al panel
          </Link>

          <div className="mb-8 mt-6">
            <p className="text-sm font-black uppercase tracking-widest text-green-600">
              MercaNova GO 7.5
            </p>

            <h1 className="mt-2 text-4xl font-black sm:text-5xl">
              Pedidos Premium
            </h1>

            <p className="mt-3 text-zinc-600">
              Control operativo de pedidos, estados y seguimiento comercial.
            </p>
          </div>

          <div className="mb-8 grid gap-5 md:grid-cols-4">
            <div className="rounded-3xl bg-white p-6 shadow">
              <p className="text-xs font-black uppercase text-zinc-500">
                Total pedidos
              </p>
              <h2 className="mt-2 text-4xl font-black">{orders.length}</h2>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow">
              <p className="text-xs font-black uppercase text-zinc-500">
                Pendientes
              </p>
              <h2 className="mt-2 text-4xl font-black text-yellow-600">
                {pendingCount}
              </h2>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow">
              <p className="text-xs font-black uppercase text-zinc-500">
                Entregados
              </p>
              <h2 className="mt-2 text-4xl font-black text-green-600">
                {deliveredCount}
              </h2>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow">
              <p className="text-xs font-black uppercase text-zinc-500">
                Ventas
              </p>
              <h2 className="mt-2 text-4xl font-black text-green-600">
                ${totalSales.toFixed(2)}
              </h2>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-full px-5 py-3 text-sm font-black transition ${
                  selectedStatus === status
                    ? "bg-green-600 text-white"
                    : "bg-white text-zinc-600 hover:bg-green-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow">
              <div className="text-6xl">📦</div>
              <p className="mt-5 font-bold text-zinc-500">
                Cargando pedidos...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow">
              <div className="text-6xl">📦</div>

              <h2 className="mt-4 text-2xl font-black">
                No hay pedidos en esta categoría
              </h2>

              <p className="mt-2 text-zinc-500">
                Cambia el filtro o espera nuevos pedidos.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-black uppercase tracking-widest text-green-600">
                        Pedido #{order.id}
                      </p>

                      <h2 className="mt-1 text-2xl font-black text-zinc-950">
                        {order.customers?.first_name}{" "}
                        {order.customers?.last_name}
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        📞 {order.customers?.phone}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        📍 {order.customers?.address}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className="rounded-full border border-yellow-200 bg-yellow-100 px-4 py-2 text-sm font-black text-yellow-700"
                      >
                        {editableStatus.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <p className="mt-3 text-3xl font-black text-green-600">
                        ${Number(order.total).toFixed(2)}
                      </p>

                      <p className="text-sm text-zinc-500">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4"
                      >
                        <div>
                          <p className="font-black">
                            {item.products?.name ?? "Producto"}
                          </p>

                          <p className="text-sm text-zinc-500">
                            Cantidad: {item.quantity} · Precio: $
                            {Number(item.unit_price).toFixed(2)}
                          </p>
                        </div>

                        <p className="font-black">
                          ${Number(item.subtotal).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}