"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import AdminGuard from "@/components/admin/AdminGuard";
import { updateAdminPassword } from "@/services/updateAdminPassword";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function AdminSecurityPage() {
  const router = useRouter();

  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedAdmin = localStorage.getItem("mercanova_admin");

    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    }
  }, []);

  async function handleChangePassword() {
    if (!admin) {
      alert("No se encontró usuario administrador.");
      return;
    }

    if (!currentPassword || !newPassword || !repeatPassword) {
      alert("Completa todos los campos.");
      return;
    }

    if (newPassword.length < 8) {
      alert("La nueva contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    if (newPassword !== repeatPassword) {
      alert("Las contraseñas nuevas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      await updateAdminPassword(admin.id, currentPassword, newPassword);

      alert("Contraseña actualizada correctamente. Vuelve a iniciar sesión.");

      localStorage.removeItem("mercanova_admin");
      router.push("/admin/login");
    } catch (error) {
      console.error(error);
      alert("No se pudo cambiar la contraseña. Verifica la contraseña actual.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("mercanova_admin");
    router.push("/admin/login");
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-zinc-100 p-6 sm:p-10">
        <section className="mx-auto max-w-4xl">
          <Link href="/admin" className="font-bold text-green-600 hover:underline">
            ← Volver al panel
          </Link>

          <div className="mt-6">
            <p className="text-sm font-black uppercase tracking-widest text-green-600">
              MercaNova GO
            </p>

            <h1 className="mt-2 text-5xl font-black text-zinc-900">
              Seguridad
            </h1>

            <p className="mt-3 text-zinc-500">
              Administra el acceso del panel administrativo.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl bg-white p-8 shadow-lg">
              <div className="text-5xl">👤</div>

              <h2 className="mt-5 text-2xl font-black">
                Usuario activo
              </h2>

              <div className="mt-5 space-y-3 text-zinc-600">
                <p>
                  <span className="font-black text-zinc-900">Nombre:</span>{" "}
                  {admin?.name ?? "Administrador"}
                </p>

                <p>
                  <span className="font-black text-zinc-900">Correo:</span>{" "}
                  {admin?.email ?? "Sin correo"}
                </p>

                <p>
                  <span className="font-black text-zinc-900">Rol:</span>{" "}
                  {admin?.role ?? "admin"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="mt-8 w-full rounded-xl bg-red-600 px-6 py-4 font-black text-white hover:bg-red-700"
              >
                Cerrar sesión
              </button>
            </article>

            <article className="rounded-3xl bg-white p-8 shadow-lg">
              <div className="text-5xl">🔐</div>

              <h2 className="mt-5 text-2xl font-black">
                Cambiar contraseña
              </h2>

              <div className="mt-6 space-y-4">
                <input
                  type="password"
                  placeholder="Contraseña actual"
                  className="w-full rounded-xl border p-4"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  className="w-full rounded-xl border p-4"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Repetir nueva contraseña"
                  className="w-full rounded-xl border p-4"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />

                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full rounded-xl bg-green-600 px-6 py-4 font-black text-white hover:bg-green-700 disabled:bg-zinc-300"
                >
                  {loading ? "Actualizando..." : "Actualizar contraseña"}
                </button>
              </div>
            </article>
          </div>
        </section>
      </main>
    </AdminGuard>
  );
}