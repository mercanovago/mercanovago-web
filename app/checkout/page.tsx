"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useCart } from "@/context/CartContext";
import { createCustomer } from "@/services/customers";
import {
  createOrder,
  type DeliveryType,
} from "@/services/orders";
import { createOrderItems } from "@/services/orderItems";

const MIN_PREPARATION_MINUTES = 60;
const SCHEDULE_INTERVAL_MINUTES = 15;
const OPENING_HOUR = 7;
const CLOSING_HOUR = 20;
const MAX_SCHEDULE_DAYS = 30;

interface DeliveryOption {
  id: DeliveryType;
  title: string;
  description: string;
  detail: string;
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "express",
    title: "Express",
    description: "Recibe tu compra lo antes posible.",
    detail: "Entrega estimada entre 20 y 30 minutos.",
  },
  {
    id: "scheduled",
    title: "Pedido programado",
    description: "Selecciona la fecha y el horario de entrega.",
    detail: "Intervalos disponibles cada 15 minutos.",
  },
  {
    id: "coordinated",
    title: "Entrega coordinada",
    description: "Nuestro equipo coordinará contigo el mejor horario.",
    detail: "Recibirás la confirmación mediante WhatsApp.",
  },
];

function padNumber(value: number) {
  return value.toString().padStart(2, "0");
}

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const day = padNumber(date.getDate());

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateValue: string) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(`${dateValue}T00:00:00`);

  return new Intl.DateTimeFormat("es-EC", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTimeLabel(time: string) {
  const [hour, minute] = time.split(":");

  return `${hour}h${minute}`;
}

function addMinutesToTime(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + minutesToAdd);

  return `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
}

function createDeliveryWindow(time: string) {
  const endTime = addMinutesToTime(time, SCHEDULE_INTERVAL_MINUTES);

  return `${formatTimeLabel(time)} - ${formatTimeLabel(endTime)}`;
}

function createScheduledDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function DeliveryIcon({ type }: { type: DeliveryType }) {
  if (type === "express") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-7 w-7"
      >
        <path
          d="M3 12h11M10 5l7 7-7 7M17 8h2.5A1.5 1.5 0 0 1 21 9.5v5a1.5 1.5 0 0 1-1.5 1.5H17"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "scheduled") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-7 w-7"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="16"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.8"
        />

        <path
          d="M7 3v4M17 3v4M3 10h18M12 14v3l2 1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-7 w-7"
    >
      <path
        d="M8.5 12.5 11 15l4.5-5M12 3a9 9 0 1 0 9 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M16 3h5v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-20 w-20"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="m8 12 2.6 2.6L16.5 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyCartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-20 w-20"
    >
      <path
        d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L21 7H6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="10" cy="20" r="1.2" fill="currentColor" />
      <circle cx="18" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}

export default function CheckoutPage() {
  const { cart, subtotal, totalItems, clearCart } = useCart();

  const today = useMemo(() => new Date(), []);

  const maximumScheduleDate = useMemo(() => {
    const date = new Date();

    date.setDate(date.getDate() + MAX_SCHEDULE_DAYS);

    return date;
  }, []);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("Contra entrega");

  const [deliveryType, setDeliveryType] =
    useState<DeliveryType>("express");

  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const delivery = 0;
  const total = subtotal + delivery;

  const availableTimeSlots = useMemo(() => {
    const slots: string[] = [];

    for (
      let hour = OPENING_HOUR;
      hour < CLOSING_HOUR;
      hour += 1
    ) {
      for (
        let minute = 0;
        minute < 60;
        minute += SCHEDULE_INTERVAL_MINUTES
      ) {
        slots.push(`${padNumber(hour)}:${padNumber(minute)}`);
      }
    }

    if (!deliveryDate) {
      return slots;
    }

    const selectedDate = new Date(`${deliveryDate}T00:00:00`);
    const currentDate = new Date();

    const isToday =
      selectedDate.getFullYear() === currentDate.getFullYear() &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getDate() === currentDate.getDate();

    if (!isToday) {
      return slots;
    }

    const minimumAllowedTime = new Date();

    minimumAllowedTime.setMinutes(
      minimumAllowedTime.getMinutes() +
        MIN_PREPARATION_MINUTES
    );

    return slots.filter((slot) => {
      const slotDate = createScheduledDateTime(
        deliveryDate,
        slot
      );

      return slotDate >= minimumAllowedTime;
    });
  }, [deliveryDate]);

  const selectedDeliveryOption = DELIVERY_OPTIONS.find(
    (option) => option.id === deliveryType
  );

  function handleDeliveryTypeChange(type: DeliveryType) {
    setDeliveryType(type);

    if (type !== "scheduled") {
      setDeliveryDate("");
      setDeliveryTime("");
    }

    if (type !== "coordinated") {
      setDeliveryNotes("");
    }
  }

  function validateCustomerData() {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim() ||
      !address.trim()
    ) {
      alert(
        "Por favor completa nombres, apellidos, celular y dirección."
      );

      return false;
    }

    const normalizedPhone = phone.replace(/\s/g, "");

    if (!/^[0-9+()-]{7,15}$/.test(normalizedPhone)) {
      alert("Ingresa un número de celular válido.");

      return false;
    }

    if (
      email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      alert("Ingresa un correo electrónico válido.");

      return false;
    }

    return true;
  }

  function validateDeliveryData() {
    if (deliveryType !== "scheduled") {
      return true;
    }

    if (!deliveryDate || !deliveryTime) {
      alert(
        "Selecciona la fecha y el horario para tu pedido programado."
      );

      return false;
    }

    const selectedDateTime = createScheduledDateTime(
      deliveryDate,
      deliveryTime
    );

    const minimumAllowedDateTime = new Date();

    minimumAllowedDateTime.setMinutes(
      minimumAllowedDateTime.getMinutes() +
        MIN_PREPARATION_MINUTES
    );

    if (selectedDateTime < minimumAllowedDateTime) {
      alert(
        `El pedido programado requiere al menos ${MIN_PREPARATION_MINUTES} minutos de preparación.`
      );

      return false;
    }

    return true;
  }

  async function handleConfirmOrder() {
    if (!validateCustomerData()) {
      return;
    }

    if (!validateDeliveryData()) {
      return;
    }

    if (cart.length === 0) {
      alert("Tu canasta está vacía.");

      return;
    }

    try {
      setLoading(true);

      const customer = await createCustomer({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      });

      const expressEstimatedDelivery =
        deliveryType === "express"
          ? new Date(
              Date.now() + 30 * 60 * 1000
            ).toISOString()
          : null;

      const scheduledEstimatedDelivery =
        deliveryType === "scheduled" &&
        deliveryDate &&
        deliveryTime
          ? createScheduledDateTime(
              deliveryDate,
              deliveryTime
            ).toISOString()
          : null;

      const order = await createOrder({
        customer_id: customer.id,
        subtotal,
        delivery,
        total,
        payment_method: paymentMethod,
        status: "Pendiente",

        delivery_type: deliveryType,

        delivery_date:
          deliveryType === "scheduled"
            ? deliveryDate
            : null,

        delivery_time:
          deliveryType === "scheduled"
            ? deliveryTime
            : null,

        delivery_window:
          deliveryType === "scheduled" && deliveryTime
            ? createDeliveryWindow(deliveryTime)
            : null,

        estimated_delivery:
          expressEstimatedDelivery ??
          scheduledEstimatedDelivery,

        delivery_notes:
          deliveryType === "coordinated"
            ? deliveryNotes.trim() || null
            : null,

        delivery_status:
          deliveryType === "scheduled"
            ? "Programada"
            : deliveryType === "coordinated"
              ? "Por coordinar"
              : "Pendiente",
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
      console.error("Error confirmando pedido:", error);

      alert(
        "No se pudo confirmar el pedido. Revisa los datos e intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 py-12">
        <section className="w-full max-w-2xl rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-xl sm:p-12">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-green-50 text-green-600">
            <SuccessIcon />
          </div>

          <p className="mt-8 text-sm font-black uppercase tracking-[0.24em] text-green-600">
            Confirmación
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Pedido recibido
          </h1>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-zinc-600">
            Gracias por comprar en MercaNova GO. Tu pedido fue
            registrado correctamente y será gestionado según la
            modalidad de entrega seleccionada.
          </p>

          <div className="mt-8 rounded-3xl bg-zinc-50 p-6 text-left">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
              Modalidad seleccionada
            </p>

            <p className="mt-2 text-xl font-black text-zinc-950">
              {selectedDeliveryOption?.title}
            </p>

            <p className="mt-1 text-sm leading-6 text-zinc-600">
              {selectedDeliveryOption?.detail}
            </p>

            {deliveryType === "scheduled" &&
              deliveryDate &&
              deliveryTime && (
                <div className="mt-4 rounded-2xl bg-white p-4">
                  <p className="text-sm font-black text-zinc-900">
                    {formatDisplayDate(deliveryDate)}
                  </p>

                  <p className="mt-1 text-sm text-zinc-600">
                    {createDeliveryWindow(deliveryTime)}
                  </p>
                </div>
              )}

            {deliveryType === "coordinated" && (
              <div className="mt-4 rounded-2xl bg-white p-4">
                <p className="text-sm font-black text-zinc-900">
                  Pendiente de coordinación
                </p>

                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Nuestro equipo se comunicará contigo mediante
                  WhatsApp para confirmar la fecha y el horario.
                </p>
              </div>
            )}
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-green-600 px-8 py-4 font-black text-white shadow-lg transition hover:bg-green-700 active:scale-[0.98]"
          >
            Volver al inicio
          </Link>
        </section>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 py-12">
        <section className="w-full max-w-2xl rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-xl sm:p-12">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
            <EmptyCartIcon />
          </div>

          <p className="mt-8 text-sm font-black uppercase tracking-[0.24em] text-green-600">
            MercaNova GO
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Tu canasta está vacía
          </h1>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-zinc-600">
            Agrega productos del catálogo antes de continuar con tu
            compra.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-green-600 px-8 py-4 font-black text-white shadow-lg transition hover:bg-green-700 active:scale-[0.98]"
          >
            Volver al catálogo
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-black text-zinc-600 transition hover:text-green-700"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path
                d="m15 18-6-6 6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            Volver al catálogo
          </Link>

          <p className="mt-8 text-sm font-black uppercase tracking-[0.24em] text-green-600">
            Checkout seguro
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
            Finalizar compra
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
            Completa tus datos y selecciona cómo deseas recibir tu
            pedido.
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-6">
            <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 font-black text-green-700">
                  1
                </div>

                <div>
                  <h2 className="text-2xl font-black text-zinc-950">
                    Datos del cliente
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Información necesaria para registrar y entregar tu
                    pedido.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-zinc-700">
                    Nombres
                  </span>

                  <input
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(event.target.value)
                    }
                    placeholder="Ingresa tus nombres"
                    autoComplete="given-name"
                    className="w-full rounded-2xl border border-zinc-300 bg-white p-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-zinc-700">
                    Apellidos
                  </span>

                  <input
                    value={lastName}
                    onChange={(event) =>
                      setLastName(event.target.value)
                    }
                    placeholder="Ingresa tus apellidos"
                    autoComplete="family-name"
                    className="w-full rounded-2xl border border-zinc-300 bg-white p-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-zinc-700">
                    Celular
                  </span>

                  <input
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="Ejemplo: 0987654321"
                    inputMode="tel"
                    autoComplete="tel"
                    className="w-full rounded-2xl border border-zinc-300 bg-white p-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black text-zinc-700">
                    Correo electrónico
                  </span>

                  <input
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Opcional"
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-2xl border border-zinc-300 bg-white p-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 font-black text-green-700">
                  2
                </div>

                <div>
                  <h2 className="text-2xl font-black text-zinc-950">
                    Dirección de entrega
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Incluye calles, numeración, sector y una
                    referencia.
                  </p>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-zinc-700">
                  Dirección completa
                </span>

                <textarea
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  rows={5}
                  placeholder="Ejemplo: Av. principal y calle secundaria, casa color blanco, junto a..."
                  autoComplete="street-address"
                  className="w-full resize-none rounded-2xl border border-zinc-300 bg-white p-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
                />
              </label>
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 font-black text-green-700">
                  3
                </div>

                <div>
                  <h2 className="text-2xl font-black text-zinc-950">
                    Modalidad de entrega
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Selecciona la alternativa que mejor se adapte a tu
                    compra.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {DELIVERY_OPTIONS.map((option) => {
                  const isSelected =
                    deliveryType === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        handleDeliveryTypeChange(option.id)
                      }
                      aria-pressed={isSelected}
                      className={`group relative rounded-3xl border p-5 text-left transition ${
                        isSelected
                          ? "border-green-600 bg-green-50 shadow-[0_12px_35px_rgba(22,163,74,0.12)]"
                          : "border-zinc-200 bg-white hover:border-green-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                            isSelected
                              ? "bg-green-600 text-white"
                              : "bg-zinc-100 text-zinc-700 group-hover:bg-green-50 group-hover:text-green-700"
                          }`}
                        >
                          <DeliveryIcon type={option.id} />
                        </div>

                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-green-600 bg-green-600"
                              : "border-zinc-300"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              viewBox="0 0 20 20"
                              fill="none"
                              aria-hidden="true"
                              className="h-4 w-4 text-white"
                            >
                              <path
                                d="m5.5 10 3 3 6-6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                      </div>

                      <h3 className="mt-5 text-lg font-black text-zinc-950">
                        {option.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                        {option.description}
                      </p>

                      <p
                        className={`mt-4 text-xs font-black uppercase leading-5 tracking-wide ${
                          isSelected
                            ? "text-green-700"
                            : "text-zinc-500"
                        }`}
                      >
                        {option.detail}
                      </p>
                    </button>
                  );
                })}
              </div>

              {deliveryType === "express" && (
                <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-5">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-600 text-white">
                      <DeliveryIcon type="express" />
                    </div>

                    <div>
                      <p className="font-black text-green-950">
                        Entrega prioritaria
                      </p>

                      <p className="mt-1 text-sm leading-6 text-green-800">
                        Prepararemos tu pedido inmediatamente. El
                        tiempo estimado de entrega es de 20 a 30
                        minutos y puede variar según la distancia y la
                        demanda.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {deliveryType === "scheduled" && (
                <div className="mt-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
                  <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-black text-green-950">
                      Horario tentativo de atención
                    </p>

                    <p className="mt-1 text-sm leading-6 text-green-800">
                      De 07h00 a 20h00, con intervalos de entrega cada
                      15 minutos.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-zinc-700">
                        Fecha de entrega
                      </span>

                      <input
                        type="date"
                        value={deliveryDate}
                        min={formatDateForInput(today)}
                        max={formatDateForInput(
                          maximumScheduleDate
                        )}
                        onChange={(event) => {
                          setDeliveryDate(event.target.value);
                          setDeliveryTime("");
                        }}
                        className="w-full rounded-2xl border border-zinc-300 bg-white p-4 text-zinc-950 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-black text-zinc-700">
                        Horario de entrega
                      </span>

                      <select
                        value={deliveryTime}
                        onChange={(event) =>
                          setDeliveryTime(event.target.value)
                        }
                        disabled={!deliveryDate}
                        className="w-full rounded-2xl border border-zinc-300 bg-white p-4 text-zinc-950 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
                      >
                        <option value="">
                          {deliveryDate
                            ? "Selecciona un horario"
                            : "Selecciona primero una fecha"}
                        </option>

                        {availableTimeSlots.map((time) => (
                          <option key={time} value={time}>
                            {createDeliveryWindow(time)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {deliveryDate &&
                    availableTimeSlots.length === 0 && (
                      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-800">
                        Ya no existen horarios disponibles para hoy.
                        Selecciona una fecha posterior.
                      </div>
                    )}

                  <p className="mt-5 text-sm leading-6 text-zinc-600">
                    Los pedidos programados requieren un mínimo de{" "}
                    <strong>
                      {MIN_PREPARATION_MINUTES} minutos
                    </strong>{" "}
                    de preparación. Los horarios vencidos se bloquean
                    automáticamente.
                  </p>
                </div>
              )}

              {deliveryType === "coordinated" && (
                <div className="mt-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-zinc-700">
                      Indicaciones para coordinar la entrega
                    </span>

                    <textarea
                      value={deliveryNotes}
                      onChange={(event) =>
                        setDeliveryNotes(event.target.value)
                      }
                      rows={4}
                      placeholder="Ejemplo: prefiero recibir el pedido mañana durante la tarde."
                      className="w-full resize-none rounded-2xl border border-zinc-300 bg-white p-4 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-green-600 focus:ring-4 focus:ring-green-100"
                    />
                  </label>

                  <p className="mt-4 text-sm leading-6 text-zinc-600">
                    MercaNova GO se comunicará contigo mediante
                    WhatsApp convencional para confirmar la fecha y
                    el horario.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 font-black text-green-700">
                  4
                </div>

                <div>
                  <h2 className="text-2xl font-black text-zinc-950">
                    Forma de pago
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Selecciona el método con el que realizarás el
                    pago.
                  </p>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-zinc-700">
                  Método de pago
                </span>

                <select
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                  className="w-full rounded-2xl border border-zinc-300 bg-white p-4 text-zinc-950 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100"
                >
                  <option value="Contra entrega">
                    Contra entrega
                  </option>

                  <option value="Transferencia bancaria">
                    Transferencia bancaria
                  </option>

                  <option value="Pago móvil">
                    Pago móvil
                  </option>
                </select>
              </label>
            </div>
          </section>

          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-xl">
              <div className="border-b border-zinc-200 p-6 sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-green-600">
                  Tu compra
                </p>

                <h2 className="mt-2 text-3xl font-black text-zinc-950">
                  Resumen
                </h2>
              </div>

              <div className="max-h-[360px] space-y-5 overflow-y-auto p-6 sm:p-8">
                {cart.map((item) => (
                  <article
                    key={item.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-black text-zinc-900">
                        {item.name}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Cantidad: {item.quantity}
                      </p>
                    </div>

                    <span className="shrink-0 font-black text-zinc-950">
                      $
                      {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </article>
                ))}
              </div>

              <div className="border-t border-zinc-200 bg-zinc-50 p-6 sm:p-8">
                <div className="space-y-4">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-zinc-600">
                      Productos
                    </span>

                    <span className="font-black text-zinc-950">
                      {totalItems}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-zinc-600">
                      Subtotal
                    </span>

                    <span className="font-black text-zinc-950">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-zinc-600">
                      Envío
                    </span>

                    <span className="font-black text-green-700">
                      Gratis
                    </span>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                      Modalidad
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700">
                        <DeliveryIcon type={deliveryType} />
                      </div>

                      <div>
                        <p className="font-black text-zinc-950">
                          {selectedDeliveryOption?.title}
                        </p>

                        {deliveryType === "scheduled" &&
                          deliveryDate &&
                          deliveryTime && (
                            <>
                              <p className="mt-1 text-xs font-bold capitalize text-zinc-500">
                                {formatDisplayDate(
                                  deliveryDate
                                )}
                              </p>

                              <p className="mt-1 text-xs font-bold text-zinc-500">
                                {createDeliveryWindow(
                                  deliveryTime
                                )}
                              </p>
                            </>
                          )}

                        {deliveryType === "coordinated" && (
                          <p className="mt-1 text-xs font-bold text-zinc-500">
                            Pendiente de confirmación
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="my-6 border-t border-dashed border-zinc-300" />

                <div className="flex items-end justify-between gap-4">
                  <span className="text-lg font-black text-zinc-950">
                    Total
                  </span>

                  <span className="text-4xl font-black tracking-tight text-green-600">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={loading}
                  className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 px-6 py-4 text-lg font-black text-white shadow-lg transition hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
                >
                  {loading && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-5 w-5 animate-spin"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="opacity-30"
                      />

                      <path
                        d="M21 12a9 9 0 0 0-9-9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}

                  {loading
                    ? "Registrando pedido..."
                    : "Confirmar pedido"}
                </button>

                <div className="mt-5 flex items-start gap-3 text-xs leading-5 text-zinc-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-green-600"
                  >
                    <path
                      d="M8 10V8a4 4 0 1 1 8 0v2M6 10h12v10H6V10Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <p>
                    Tus datos serán utilizados únicamente para
                    gestionar esta compra y coordinar su entrega.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}