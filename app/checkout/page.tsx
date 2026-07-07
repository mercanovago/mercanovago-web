"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { createCustomer } from "@/services/customers";
import { createOrder } from "@/services/orders";
import { createOrderItems } from "@/services/orderItems";

export default function CheckoutPage() {
  const { cart, subtotal, totalItems, clearCart } = useCart();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Contra entrega");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const delivery = 0;
  const total = subtotal + delivery;

  const handleConfirmOrder = async () => {
    if (!firstName || !lastName || !phone || !address) {
      alert("Por favor completa nombres, apellidos, celular y dirección.");
      return;
    }

    try {
      setLoading(true);

      const customer = await createCustomer({
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        address,
      });

      const order = await createOrder({
        customer_id: customer.id,
        subtotal,
        delivery,
        total,
        payment_method: paymentMethod,
        status: "Pendiente",
      });

      await createOrderItems(
        cart.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        }))
      );

      clearCart();
      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert("No se pudo confirmar el pedido. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
        <div className="text-center">
          <div className="text-7xl">✅</div>

          <h1 className="mt-6 text-4xl font-black text-zinc-900">
            Pedido recibido
          </h1>

          <p className="mt-4 text-zinc-500">
            Gracias por comprar en MercaNova GO. Tu pedido fue registrado correctamente.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block rounded-2xl bg-green-600 px-8 py-4 font-black text-white transition hover:bg-green-700"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
        <div className="text-center">
          <div className="text-7xl">🛒</div>

          <h1 className="mt-6 text-4xl font-black text-zinc-900">
            Tu canasta está vacía
          </h1>

          <p className="mt-4 text-zinc-500">
            Agrega algunos productos antes de continuar.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block rounded-2xl bg-green-600 px-8 py-4 font-black text-white transition hover:bg-green-700"
          >
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10">
        <p className="text-sm font-black uppercase tracking-widest text-green-600">
          Checkout
        </p>

        <h1 className="mt-2 text-5xl font-black text-zinc-900">
          Finalizar compra
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-black">Datos del cliente</h2>

            <div className="grid gap-5 md:grid-cols-2">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nombres"
                className="rounded-2xl border p-4"
              />

              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Apellidos"
                className="rounded-2xl border p-4"
              />

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Celular"
                className="rounded-2xl border p-4"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="rounded-2xl border p-4"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-black">Dirección de entrega</h2>

            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={5}
              placeholder="Escribe la dirección completa..."
              className="w-full rounded-2xl border p-4"
            />
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-black">Forma de pago</h2>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-2xl border p-4"
            >
              <option>Contra entrega</option>
              <option>Transferencia bancaria</option>
              <option>Pago móvil</option>
            </select>
          </div>
        </section>

        <aside>
          <div className="sticky top-24 rounded-3xl border border-zinc-200 bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-black">Resumen</h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-zinc-500">x{item.quantity}</p>
                  </div>

                  <span className="font-black">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="my-6 border-t pt-6">
              <div className="mb-3 flex justify-between">
                <span>Productos</span>
                <span>{totalItems}</span>
              </div>

              <div className="mb-3 flex justify-between">
                <span>Envío</span>
                <span className="font-bold text-green-600">Gratis</span>
              </div>

              <div className="mt-6 flex justify-between text-3xl font-black">
                <span>Total</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmOrder}
              disabled={loading}
              className="mt-8 w-full rounded-2xl bg-green-600 py-4 text-lg font-black text-white transition hover:bg-green-700 disabled:bg-zinc-300"
            >
              {loading ? "Registrando pedido..." : "Confirmar pedido"}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}