"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import AdminGuard from "@/components/admin/AdminGuard";
import { getAdminCustomers } from "@/services/adminCustomers";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      const data = await getAdminCustomers();
      setCustomers(data);
      setLoading(false);
    }

    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return customers;

    return customers.filter((customer) => {
      const fullName = `${customer.first_name ?? ""} ${
        customer.last_name ?? ""
      }`.toLowerCase();

      return (
        fullName.includes(term) ||
        String(customer.phone ?? "").toLowerCase().includes(term) ||
        String(customer.email ?? "").toLowerCase().includes(term) ||
        String(customer.address ?? "").toLowerCase().includes(term)
      );
    });
  }, [customers, search]);

  const totalCustomers = customers.length;

  const totalOrders = customers.reduce(
    (sum, customer) => sum + (customer.orders?.length ?? 0),
    0
  );

  const totalSales = customers.reduce((sum, customer) => {
    const orders = customer.orders ?? [];

    return (
      sum +
      orders.reduce(
        (orderSum: number, order: any) => orderSum + Number(order.total ?? 0),
        0
      )
    );
  }, 0);

  const bestCustomer = customers.reduce((best: any | null, customer) => {
    const orders = customer.orders ?? [];
    const totalSpent = orders.reduce(
      (sum: number, order: any) => sum + Number(order.total ?? 0),
      0
    );

    if (!best || totalSpent > best.totalSpent) {
      return {
        ...customer,
        totalSpent,
      };
    }

    return best;
  }, null);

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

          <div className="mb-8 mt-6">
            <p className="text-sm font-black uppercase tracking-widest text-green-600">
              MercaNova GO 7.5
            </p>

            <h1 className="mt-2 text-4xl font-black sm:text-5xl">
              Clientes Premium
            </h1>

            <p className="mt-3 text-zinc-600">
              Gestión comercial de clientes, compras y seguimiento.
            </p>
          </div>

          <div className="mb-8 grid gap-5 md:grid-cols-4">
            <div className="rounded-3xl bg-white p-6 shadow">
              <p className="text-xs font-black uppercase text-zinc-500">
                Clientes
              </p>
              <h2 className="mt-2 text-4xl font-black">{totalCustomers}</h2>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow">
              <p className="text-xs font-black uppercase text-zinc-500">
                Pedidos
              </p>
              <h2 className="mt-2 text-4xl font-black">{totalOrders}</h2>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow">
              <p className="text-xs font-black uppercase text-zinc-500">
                Total comprado
              </p>
              <h2 className="mt-2 text-4xl font-black text-green-600">
                ${totalSales.toFixed(2)}
              </h2>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow">
              <p className="text-xs font-black uppercase text-zinc-500">
                Mejor cliente
              </p>
              <h2 className="mt-2 truncate text-2xl font-black text-green-600">
                {bestCustomer
                  ? `${bestCustomer.first_name} ${bestCustomer.last_name}`
                  : "Sin datos"}
              </h2>
            </div>
          </div>

          <div className="mb-8 rounded-3xl bg-white p-5 shadow">
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, correo o dirección..."
              className="w-full rounded-2xl border border-zinc-200 p-4 font-bold outline-none focus:border-green-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow">
              <div className="text-6xl">👥</div>

              <p className="mt-5 font-bold text-zinc-500">
                Cargando clientes...
              </p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow">
              <div className="text-6xl">👥</div>

              <h2 className="mt-4 text-2xl font-black">
                No se encontraron clientes
              </h2>

              <p className="mt-2 text-zinc-500">
                Intenta con otro nombre, teléfono, correo o dirección.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredCustomers.map((customer) => {
                const orders = customer.orders ?? [];

                const totalSpent = orders.reduce(
                  (sum: number, order: any) => sum + Number(order.total ?? 0),
                  0
                );

                const lastOrder = orders[0];

                return (
                  <article
                    key={customer.id}
                    className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-green-600">
                          Cliente #{customer.id}
                        </p>

                        <h2 className="mt-2 text-2xl font-black">
                          {customer.first_name} {customer.last_name}
                        </h2>
                      </div>

                      <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-black text-green-700">
                        Activo
                      </span>
                    </div>

                    <div className="mt-5 space-y-2 text-sm text-zinc-600">
                      <p>📞 {customer.phone}</p>

                      <p>
                        ✉️{" "}
                        {customer.email
                          ? customer.email
                          : "Sin correo registrado"}
                      </p>

                      <p>📍 {customer.address}</p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-zinc-100 p-4">
                        <p className="text-xs font-black uppercase text-zinc-500">
                          Pedidos
                        </p>

                        <p className="mt-2 text-3xl font-black">
                          {orders.length}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-green-50 p-4">
                        <p className="text-xs font-black uppercase text-green-700">
                          Total comprado
                        </p>

                        <p className="mt-2 text-3xl font-black text-green-600">
                          ${totalSpent.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl bg-zinc-50 p-4">
                      <p className="text-xs font-black uppercase text-zinc-500">
                        Último pedido
                      </p>

                      <p className="mt-2 font-bold text-zinc-700">
                        {lastOrder
                          ? `Pedido #${lastOrder.id} · $${Number(
                              lastOrder.total ?? 0
                            ).toFixed(2)}`
                          : "Sin pedidos registrados"}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}