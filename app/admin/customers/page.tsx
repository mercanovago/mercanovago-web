"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdminGuard from "@/components/admin/AdminGuard";
import { getAdminCustomers } from "@/services/adminCustomers";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      const data = await getAdminCustomers();
      setCustomers(data);
      setLoading(false);
    }

    loadCustomers();
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

          <div className="mb-8 mt-6">
            <p className="text-sm font-black uppercase tracking-widest text-green-600">
              MercaNova GO
            </p>

            <h1 className="mt-2 text-4xl font-black sm:text-5xl">
              Clientes registrados
            </h1>

            <p className="mt-3 text-zinc-600">
              Compradores registrados que ya realizaron pedidos.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow">
              <div className="text-6xl">👥</div>

              <p className="mt-5 font-bold text-zinc-500">
                Cargando clientes...
              </p>
            </div>
          ) : customers.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow">
              <div className="text-6xl">👥</div>

              <h2 className="mt-4 text-2xl font-black">
                No existen clientes registrados
              </h2>

              <p className="mt-2 text-zinc-500">
                Cuando alguien realice su primera compra aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {customers.map((customer) => {
                const orders = customer.orders ?? [];

                const totalSpent = orders.reduce(
                  (sum: number, order: any) =>
                    sum + Number(order.total ?? 0),
                  0
                );

                return (
                  <article
                    key={customer.id}
                    className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <p className="text-sm font-black uppercase tracking-widest text-green-600">
                      Cliente #{customer.id}
                    </p>

                    <h2 className="mt-2 text-2xl font-black">
                      {customer.first_name} {customer.last_name}
                    </h2>

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