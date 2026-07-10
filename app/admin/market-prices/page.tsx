"use client";

import { useState } from "react";
import Link from "next/link";

import AdminGuard from "@/components/admin/AdminGuard";
import {
  compareMarketPrices,
  MarketPriceResult,
} from "@/services/marketPricing";

export default function AdminMarketPricesPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MarketPriceResult[]>([]);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setFileName(file.name);
    setImagePreview(URL.createObjectURL(file));
    setResults([]);
  }

  async function handleAnalyzeImage() {
    if (!imagePreview) {
      alert("Primero sube la imagen semanal del Mercado Mayorista.");
      return;
    }

    try {
      setLoading(true);
      const data = await compareMarketPrices();
      setResults(data);
    } catch (error) {
      console.error(error);
      alert("No se pudo analizar la imagen.");
    } finally {
      setLoading(false);
    }
  }

  const totalDetected = results.length;
  const toUpdate = results.filter((item) => item.status === "Actualizar").length;
  const unchanged = results.filter((item) => item.status === "Sin cambios").length;
  const notFound = results.filter((item) => item.status === "No encontrado").length;

  return (
    <AdminGuard>
      <main className="min-h-screen bg-zinc-100 p-6 sm:p-10">
        <div className="mx-auto max-w-7xl">
          <Link href="/admin" className="font-bold text-green-600 hover:underline">
            ← Volver al panel
          </Link>

          <div className="mb-10 mt-6">
            <p className="text-sm font-black uppercase tracking-widest text-green-600">
              MercaNova GO 8.6
            </p>

            <h1 className="mt-2 text-4xl font-black sm:text-5xl">
              Motor de precios
            </h1>

            <p className="mt-3 max-w-3xl text-zinc-600">
              Sube la imagen semanal, analiza los precios detectados y revisa el
              precio final sugerido con margen interno de MercaNova GO.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="rounded-[2rem] bg-white p-8 shadow">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-green-700" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M4 7h3l2-3h6l2 3h3v13H4V7Z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>

              <h2 className="mt-6 text-3xl font-black">Subir imagen semanal</h2>

              <p className="mt-3 text-zinc-500">
                Usa una imagen clara y completa de la lista de precios.
              </p>

              <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-green-300 bg-green-50 p-10 text-center transition hover:bg-green-100">
                <span className="text-xl font-black text-green-700">
                  Seleccionar imagen
                </span>

                <span className="mt-2 text-sm font-bold text-zinc-500">
                  JPG, PNG o captura de pantalla
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {fileName && (
                <div className="mt-5 rounded-2xl bg-zinc-100 p-4 font-bold text-zinc-700">
                  Archivo seleccionado: {fileName}
                </div>
              )}

              <button
                onClick={handleAnalyzeImage}
                disabled={loading}
                className="mt-8 w-full rounded-2xl bg-green-600 px-8 py-5 text-lg font-black text-white transition hover:bg-green-700 disabled:bg-zinc-300"
              >
                {loading ? "Analizando precios..." : "Analizar imagen"}
              </button>
            </section>

            <section className="rounded-[2rem] bg-white p-8 shadow">
              <h2 className="text-3xl font-black">Resumen interno</h2>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-zinc-100 p-5">
                  <p className="text-xs font-black uppercase text-zinc-500">
                    Detectados
                  </p>
                  <p className="mt-2 text-3xl font-black">{totalDetected}</p>
                </div>

                <div className="rounded-2xl bg-yellow-50 p-5">
                  <p className="text-xs font-black uppercase text-yellow-700">
                    Por actualizar
                  </p>
                  <p className="mt-2 text-3xl font-black text-yellow-700">
                    {toUpdate}
                  </p>
                </div>

                <div className="rounded-2xl bg-green-50 p-5">
                  <p className="text-xs font-black uppercase text-green-700">
                    Sin cambios
                  </p>
                  <p className="mt-2 text-3xl font-black text-green-600">
                    {unchanged}
                  </p>
                </div>

                <div className="rounded-2xl bg-red-50 p-5">
                  <p className="text-xs font-black uppercase text-red-700">
                    No encontrados
                  </p>
                  <p className="mt-2 text-3xl font-black text-red-600">
                    {notFound}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {imagePreview && (
            <section className="mt-8 rounded-[2rem] bg-white p-8 shadow">
              <p className="text-sm font-black uppercase tracking-widest text-green-600">
                Vista previa
              </p>

              <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100">
                <img
                  src={imagePreview}
                  alt="Imagen semanal del Mercado Mayorista"
                  className="max-h-[420px] w-full object-contain"
                />
              </div>
            </section>
          )}

          {results.length > 0 && (
            <section className="mt-8 rounded-[2rem] bg-white p-8 shadow">
              <p className="text-sm font-black uppercase tracking-widest text-green-600">
                Comparación interna
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Precios sugeridos para revisión
              </h2>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[900px] border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs font-black uppercase text-zinc-500">
                      <th className="px-4">Producto</th>
                      <th className="px-4">Categoría</th>
                      <th className="px-4">Mercado</th>
                      <th className="px-4">Margen</th>
                      <th className="px-4">Ganancia</th>
                      <th className="px-4">Precio actual</th>
                      <th className="px-4">Precio sugerido</th>
                      <th className="px-4">Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {results.map((item) => (
                      <tr key={item.name} className="rounded-2xl bg-zinc-50 font-bold">
                        <td className="rounded-l-2xl px-4 py-4 font-black">
                          {item.name}
                        </td>
                        <td className="px-4 py-4">{item.category}</td>
                        <td className="px-4 py-4">${item.marketPrice.toFixed(2)}</td>
                        <td className="px-4 py-4">{item.marginPercentage}%</td>
                        <td className="px-4 py-4">${item.marginValue.toFixed(2)}</td>
                        <td className="px-4 py-4">${item.currentPrice.toFixed(2)}</td>
                        <td className="px-4 py-4 text-green-600">
                          ${item.suggestedPrice.toFixed(2)}
                        </td>
                        <td className="rounded-r-2xl px-4 py-4">
                          <span
                            className={`rounded-full px-4 py-2 text-xs font-black ${
                              item.status === "Actualizar"
                                ? "bg-yellow-100 text-yellow-700"
                                : item.status === "No encontrado"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button className="mt-8 w-full rounded-2xl bg-zinc-900 px-8 py-5 text-lg font-black text-white hover:bg-zinc-800">
                Confirmar actualización del catálogo
              </button>
            </section>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}