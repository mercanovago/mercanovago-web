"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanEmail === "admin@mercanovago.com" && cleanPassword === "admin123") {
      localStorage.setItem(
        "mercanova_admin",
        JSON.stringify({
          id: 1,
          name: "Administrador General",
          email: "admin@mercanovago.com",
          role: "admin",
          active: true,
        })
      );

      router.push("/admin");
      return;
    }

    alert("Usuario o contraseña incorrectos.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <p className="text-sm font-black uppercase tracking-widest text-green-600">
          MercaNova GO
        </p>

        <h1 className="mt-2 text-4xl font-black">
          Ingreso administrador
        </h1>

        <p className="mt-3 text-zinc-500">
          Panel Premium 7.4
        </p>

        <div className="mt-8 space-y-5">
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full rounded-xl border p-4 outline-none focus:border-green-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full rounded-xl border p-4 outline-none focus:border-green-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
          />

          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-green-600 p-4 font-black text-white transition hover:bg-green-700"
          >
            Ingresar
          </button>
        </div>
      </section>
    </main>
  );
}