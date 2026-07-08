"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const admin = localStorage.getItem("mercanova_admin");

    if (!admin) {
      router.push("/admin/login");
      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        <section className="rounded-3xl bg-white p-10 text-center shadow-xl">
          <div className="text-6xl">🔐</div>

          <h1 className="mt-5 text-2xl font-black text-zinc-900">
            Verificando acceso
          </h1>

          <p className="mt-2 text-zinc-500">
            Estamos validando tu sesión administrativa.
          </p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}