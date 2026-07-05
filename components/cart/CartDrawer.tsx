"use client";

import { useState } from "react";
import { useCart } from "../../context/CartContext";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const advisors = [
  { label: "Asesor Comercial 1", phone: "593983170593" },
  { label: "Asesor Comercial 2", phone: "593963488825" },
];

const deliveryZones = [
  { name: "Centro", price: 1.0, time: "20-25 min" },
  { name: "La Estación", price: 1.0, time: "20-25 min" },
  { name: "La Dolorosa", price: 1.25, time: "25-30 min" },
  { name: "Lizarzaburu", price: 1.5, time: "25-35 min" },
  { name: "Bellavista", price: 1.5, time: "30-35 min" },
  { name: "San Alfonso", price: 1.5, time: "30 min" },
  { name: "Yaruquíes", price: 2.0, time: "35-40 min" },
  { name: "Licán", price: 2.5, time: "40-45 min" },
  { name: "Calpi", price: 2.75, time: "45 min" },
  { name: "Maldonado", price: 2.75, time: "45 min" },
];

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const {
    cart,
    subtotal,
    totalItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");
  const [payment, setPayment] = useState("Efectivo");
  const [sector, setSector] = useState("Centro");

  if (!open) return null;

  const currentZone =
    deliveryZones.find((zone) => zone.name === sector) ?? deliveryZones[0];

  const shipping = currentZone.price;
  const total = subtotal + shipping;

  const buildMessage = () => {
    const products = cart
      .map(
        (item) =>
          `✅ ${item.quantity} x ${item.name} (${item.unit}) - $${(
            item.price * item.quantity
          ).toFixed(2)}`
      )
      .join("\n");

    return encodeURIComponent(
      `🛒 MERCANOVA GO\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `👤 Cliente:\n${name}\n\n` +
        `📱 Teléfono:\n${phone}\n\n` +
        `📍 Dirección:\n${address}\n\n` +
        `📌 Sector:\n${sector}\n\n` +
        `🧭 Referencia:\n${reference}\n\n` +
        `💳 Método de pago:\n${payment}\n\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `🧺 PRODUCTOS\n\n${products}\n\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `Subtotal: $${subtotal.toFixed(2)}\n` +
        `Envío: $${shipping.toFixed(2)}\n` +
        `Tiempo estimado: ${currentZone.time}\n` +
        `TOTAL: $${total.toFixed(2)}\n\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `Pedido generado desde 🌿 MercaNova GO\n` +
        `De la huerta a tu hogar`
    );
  };

  const openWhatsApp = (number: string) => {
    if (!name || !phone || !address || cart.length === 0) {
      alert("Completa nombre, teléfono, dirección y agrega productos.");
      return;
    }

    window.open(`https://wa.me/${number}?text=${buildMessage()}`, "_blank");
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/60 z-40" />

      <aside className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col">
        <div className="border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-black">Mi Canasta</h2>
            <p className="text-zinc-500">{totalItems} productos</p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl font-bold text-zinc-600 hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 && (
            <div className="flex items-center justify-center h-48 text-zinc-500">
              Tu carrito está vacío.
            </div>
          )}

          {cart.map((item) => (
            <div key={item.id} className="border-b p-4 flex gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover"
              />

              <div className="flex-1">
                <h3 className="font-bold text-black">{item.name}</h3>
                <p className="text-sm text-zinc-500">{item.unit}</p>
                <p className="font-black text-green-600 mt-1">
                  ${item.price.toFixed(2)}
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="w-8 h-8 rounded-lg bg-zinc-200 text-black"
                  >
                    -
                  </button>

                  <span className="font-bold text-black">{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="w-8 h-8 rounded-lg bg-green-600 text-white"
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-auto text-red-600 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="p-5 space-y-3">
            <h3 className="text-black font-black text-xl">
              Datos para la entrega
            </h3>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              className="w-full border rounded-xl px-4 py-3 text-black"
            />

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Teléfono"
              className="w-full border rounded-xl px-4 py-3 text-black"
            />

            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Dirección de entrega"
              className="w-full border rounded-xl px-4 py-3 text-black"
            />

            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-black"
            >
              {deliveryZones.map((zone) => (
                <option key={zone.name} value={zone.name}>
                  {zone.name}
                </option>
              ))}
            </select>

            <div className="rounded-xl bg-green-50 p-4 border border-green-200 text-black">
              <p className="font-black text-green-700">
                🚚 Información de entrega
              </p>
              <p>Envío: ${shipping.toFixed(2)}</p>
              <p>Tiempo estimado: {currentZone.time}</p>
            </div>

            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Punto de referencia"
              className="w-full border rounded-xl px-4 py-3 text-black"
            />

            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-black"
            >
              <option>Efectivo</option>
              <option>Transferencia Cooperativa Oscus</option>
              <option>Transferencia Banco ProCredit</option>
              <option>Transferencia Banco Produbanco</option>
            </select>
          </div>
        </div>

        <div className="border-t p-5">
          <div className="space-y-2 text-black mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Envío</span>
              <span>${shipping.toFixed(2)}</span>
            </div>

            <div className="border-t pt-2 flex justify-between text-xl font-black">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {advisors.map((advisor) => (
              <button
                key={advisor.phone}
                onClick={() => openWhatsApp(advisor.phone)}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl py-4 font-bold"
              >
                Enviar pedido a {advisor.label}
              </button>
            ))}
          </div>

          <button
            onClick={clearCart}
            className="w-full mt-3 border rounded-2xl py-3 font-bold text-zinc-600 hover:bg-zinc-100"
          >
            Vaciar carrito
          </button>
        </div>
      </aside>
    </>
  );
}