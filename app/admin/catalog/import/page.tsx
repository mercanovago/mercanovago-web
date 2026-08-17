"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminGuard from "@/components/admin/AdminGuard";
import ProductBulkImportModal from "@/components/admin/ProductBulkImportModal";
import { getAdminProducts } from "@/services/adminProducts";
import type { AdminProductRecord } from "@/types/adminProduct";

export default function CatalogImportPage() {
  const router = useRouter();

  const [products, setProducts] = useState<AdminProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [openImport, setOpenImport] = useState(false);

  useEffect(() => {
    void loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setLoadError("");

      const data = await getAdminProducts();

      setProducts(data);
      setOpenImport(true);
    } catch (error) {
      console.error(
        "Error cargando productos para importación masiva:",
        error
      );

      setProducts([]);
      setOpenImport(false);

      setLoadError(
        error instanceof Error
          ? error.message
          : "No fue posible cargar el catálogo actual."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCloseImport() {
    setOpenImport(false);
    router.push("/admin/catalog");
  }

  async function handleImported() {
    await loadProducts();
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-zinc-100 p-6 sm:p-10">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <section className="flex min-h-[70vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

                <p className="mt-6 font-black text-zinc-900">
                  Preparando importación masiva
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Estamos verificando el catálogo conectado con Supabase.
                </p>
              </div>
            </section>
          ) : loadError ? (
            <section className="flex min-h-[70vh] items-center justify-center">
              <div className="w-full max-w-xl rounded-[32px] border border-red-200 bg-white p-8 text-center shadow-xl sm:p-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-8 w-8"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 8v5m0 3.5v.01M10.29 3.86 2.82 17a2 2 0 0 0 1.74 3h14.88a2 2 0 0 0 1.74-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-red-600">
                  Conexión no disponible
                </p>

                <h1 className="mt-3 text-3xl font-black text-zinc-950">
                  No pudimos preparar el catálogo
                </h1>

                <p className="mt-4 text-sm leading-6 text-zinc-600">
                  {loadError}
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/catalog")}
                    className="rounded-2xl border border-zinc-300 bg-white px-6 py-3 font-black text-zinc-900 transition hover:bg-zinc-100"
                  >
                    Volver al catálogo
                  </button>

                  <button
                    type="button"
                    onClick={() => void loadProducts()}
                    className="rounded-2xl bg-green-600 px-7 py-3 font-black text-white shadow-lg transition hover:bg-green-700"
                  >
                    Reintentar conexión
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section className="flex min-h-[70vh] items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-black uppercase tracking-[0.24em] text-green-600">
                  MercaNova GO
                </p>

                <h1 className="mt-3 text-4xl font-black text-zinc-950 sm:text-5xl">
                  Importación masiva
                </h1>

                <p className="mx-auto mt-4 max-w-2xl text-zinc-500">
                  El módulo de importación se encuentra preparado para
                  procesar el catálogo mediante ExcelJS.
                </p>

                <button
                  type="button"
                  onClick={() => setOpenImport(true)}
                  className="mt-8 rounded-2xl bg-green-600 px-8 py-4 text-lg font-black text-white shadow-lg transition hover:bg-green-700"
                >
                  Abrir importación
                </button>
              </div>
            </section>
          )}
        </div>

        <ProductBulkImportModal
          open={openImport}
          products={products}
          onClose={handleCloseImport}
          onImported={handleImported}
        />
      </main>
    </AdminGuard>
  );
}