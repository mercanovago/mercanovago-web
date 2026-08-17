"use client";

import { FormEvent, useState } from "react";

import {
  getChefRecommendations,
} from "@/services/chefAssistant";

import type {
  ChefAssistantResponse,
  ChefDietaryTag,
  ChefRecipeRecommendation,
} from "@/types/chef";

const suggestionQueries = [
  "Quiero preparar locro de papa para 4 personas",
  "Necesito una comida económica para mi familia",
  "Tengo papa, queso y cebolla en casa",
  "Quiero una receta vegetariana y rápida",
];

const dietaryOptions: {
  label: string;
  value: ChefDietaryTag;
}[] = [
  {
    label: "Vegetariano",
    value: "vegetariano",
  },
  {
    label: "Vegano",
    value: "vegano",
  },
  {
    label: "Sin gluten",
    value: "sin-gluten",
  },
  {
    label: "Sin lácteos",
    value: "sin-lacteos",
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function getIntentLabel(intent: string): string {
  const labels: Record<string, string> = {
    recipe: "Receta específica",
    budget: "Compra por presupuesto",
    "available-ingredients": "Ingredientes disponibles",
    "quick-meal": "Preparación rápida",
    "family-meal": "Comida familiar",
    dietary: "Preferencias alimentarias",
    recommendation: "Recomendación",
    unknown: "Consulta general",
  };

  return labels[intent] ?? "Consulta general";
}

function ChefRecommendationCard({
  recommendation,
  primary = false,
}: {
  recommendation: ChefRecipeRecommendation;
  primary?: boolean;
}) {
  const recipe = recommendation.recipe;
  const totalTime =
    recipe.preparation_time_minutes +
    recipe.cooking_time_minutes;

  return (
    <article
      className={`overflow-hidden rounded-[2rem] border bg-white transition duration-300 ${
        primary
          ? "border-green-300 shadow-[0_28px_80px_-40px_rgba(22,163,74,0.45)]"
          : "border-zinc-200 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.35)]"
      }`}
    >
      <div
        className={`relative overflow-hidden px-6 py-6 sm:px-8 ${
          primary
            ? "bg-gradient-to-br from-green-950 via-green-800 to-zinc-950 text-white"
            : "bg-zinc-950 text-white"
        }`}
      >
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-green-400/20 blur-3xl"
        />

        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {primary && (
                <span className="rounded-full bg-green-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-green-950">
                  Recomendación principal
                </span>
              )}

              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-green-200">
                {recipe.category}
              </span>
            </div>

            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
              Coincidencia: {Math.max(recommendation.relevance_score, 0)}
            </span>
          </div>

          <h3 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            {recipe.name}
          </h3>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75 sm:text-base">
            {recipe.short_description ??
              recipe.description ??
              "Receta seleccionada por Chef MercaNova GO."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-green-200">
                Tiempo
              </p>

              <p className="mt-2 text-xl font-black">
                {totalTime} min
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-green-200">
                Porciones
              </p>

              <p className="mt-2 text-xl font-black">
                {recipe.requested_portions}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-green-200">
                Costo estimado
              </p>

              <p className="mt-2 text-xl font-black">
                {formatCurrency(recipe.estimated_cost)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-green-200">
                Por persona
              </p>

              <p className="mt-2 text-xl font-black">
                {formatCurrency(
                  recipe.estimated_cost_per_portion
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
                Ingredientes
              </p>

              <h4 className="mt-2 text-xl font-black text-zinc-950">
                Disponibilidad en catálogo
              </h4>
            </div>

            <span className="rounded-full bg-green-50 px-3 py-2 text-xs font-black text-green-700">
              {recipe.available_ingredients_count} de{" "}
              {recipe.ingredients.length}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      ingredient.available
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {ingredient.available ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="h-5 w-5"
                      >
                        <path
                          d="m5 12 4 4L19 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="h-5 w-5"
                      >
                        <path
                          d="M12 8v5M12 17h.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                      </svg>
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-black text-zinc-950">
                      {ingredient.ingredient_name}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {ingredient.scaled_quantity}{" "}
                      {ingredient.measurement_unit}
                      {ingredient.optional
                        ? " · Opcional"
                        : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-xs font-black ${
                        ingredient.available
                          ? "text-green-700"
                          : "text-amber-700"
                      }`}
                    >
                      {ingredient.available
                        ? "Disponible"
                        : "Sin vincular"}
                    </p>

                    {ingredient.available && (
                      <p className="mt-1 text-sm font-black text-zinc-950">
                        {formatCurrency(
                          ingredient.estimated_price
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
                <p className="font-bold text-zinc-500">
                  Esta receta todavía no tiene ingredientes configurados.
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
            Por qué la recomendamos
          </p>

          <h4 className="mt-2 text-xl font-black text-zinc-950">
            Análisis de Chef MercaNova GO
          </h4>

          <div className="mt-5 space-y-3">
            {recommendation.reasons.length > 0 ? (
              recommendation.reasons.map((reason) => (
                <div
                  key={reason}
                  className="flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50/60 p-4"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                      className="h-4 w-4"
                    >
                      <path
                        d="m5 10 3 3 7-7"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>

                  <p className="text-sm font-semibold leading-6 text-zinc-700">
                    {reason}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm font-semibold text-zinc-500">
                  La receta se relaciona con la consulta realizada.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div
              className={`rounded-2xl border p-4 ${
                recommendation.fits_budget
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
                Presupuesto
              </p>

              <p
                className={`mt-2 font-black ${
                  recommendation.fits_budget
                    ? "text-green-700"
                    : "text-amber-700"
                }`}
              >
                {recommendation.fits_budget
                  ? "Compatible"
                  : "Supera el valor indicado"}
              </p>
            </div>

            <div
              className={`rounded-2xl border p-4 ${
                recommendation.fits_dietary_preferences
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
                Preferencias
              </p>

              <p
                className={`mt-2 font-black ${
                  recommendation.fits_dietary_preferences
                    ? "text-green-700"
                    : "text-amber-700"
                }`}
              >
                {recommendation.fits_dietary_preferences
                  ? "Compatibles"
                  : "Requiere revisión"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ChefAssistant() {
  const [query, setQuery] = useState("");
  const [portions, setPortions] = useState(4);
  const [maximumBudget, setMaximumBudget] =
    useState("");
  const [dietaryPreferences, setDietaryPreferences] =
    useState<ChefDietaryTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] =
    useState<ChefAssistantResponse | null>(null);
  const [error, setError] = useState("");

  function toggleDietaryPreference(
    preference: ChefDietaryTag
  ) {
    setDietaryPreferences((current) =>
      current.includes(preference)
        ? current.filter(
            (item) => item !== preference
          )
        : [...current, preference]
    );
  }

  function selectSuggestion(suggestion: string) {
    setQuery(suggestion);
    setError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanQuery = query.trim();

    if (!cleanQuery) {
      setError(
        "Escribe qué deseas cocinar, tu presupuesto o los ingredientes disponibles."
      );
      return;
    }

    const parsedBudget =
      maximumBudget.trim() === ""
        ? null
        : Number(maximumBudget);

    if (
      parsedBudget !== null &&
      (!Number.isFinite(parsedBudget) ||
        parsedBudget <= 0)
    ) {
      setError(
        "Ingresa un presupuesto válido o deja el campo vacío."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResponse(null);

      const result = await getChefRecommendations({
        query: cleanQuery,
        portions,
        maximum_budget: parsedBudget,
        dietary_preferences: dietaryPreferences,
      });

      setResponse(result);

      if (!result.success) {
        setError(result.message);
      }
    } catch (requestError) {
      console.error(
        "Error consultando Chef MercaNova GO:",
        requestError
      );

      setError(
        "Chef MercaNova GO no pudo procesar la consulta. Revisa la configuración de Supabase e inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="chef-assistant-title"
      className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_30px_90px_-50px_rgba(15,23,42,0.45)]"
    >
      <div className="relative overflow-hidden bg-zinc-950 px-5 py-7 sm:px-8 sm:py-8">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-500/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-500 text-white shadow-lg shadow-green-950/40">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="h-7 w-7"
              >
                <path
                  d="M7.25 10.25A4 4 0 0 1 8.4 2.42a4.5 4.5 0 0 1 7.2 0 4 4 0 0 1 1.15 7.83M6.5 10.25h11v8.5a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-8.5Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M9 15.25h6M9 18h6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-green-300">
                Chef MercaNova GO v2
              </p>

              <h2
                id="chef-assistant-title"
                className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl"
              >
                ¿Qué deseas preparar?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-300">
                Describe el plato, el número de personas, tu presupuesto o los
                ingredientes que tienes disponibles.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-400/20 bg-green-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-green-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
            </span>

            Interpretación inteligente
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-5 sm:p-8"
      >
        <div>
          <label
            htmlFor="chef-query"
            className="text-sm font-black text-zinc-950"
          >
            Cuéntale a Chef MercaNova GO qué necesitas
          </label>

          <div className="mt-3 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 transition focus-within:border-green-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-100">
            <textarea
              id="chef-query"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setError("");
              }}
              rows={4}
              placeholder="Ejemplo: quiero preparar una comida económica para 6 personas con papa, queso y cebolla..."
              className="block w-full resize-none bg-transparent px-5 py-5 text-base font-semibold leading-7 text-zinc-950 outline-none placeholder:font-medium placeholder:text-zinc-400"
            />

            <div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-5 py-3">
              <p className="text-xs font-semibold text-zinc-400">
                {query.length}/500 caracteres
              </p>

              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResponse(null);
                  setError("");
                }}
                className="text-xs font-black text-zinc-500 transition hover:text-red-600"
              >
                Limpiar consulta
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
            Ejemplos de consulta
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {suggestionQueries.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() =>
                  selectSuggestion(suggestion)
                }
                className="rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-600 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <div>
            <label
              htmlFor="chef-portions"
              className="text-sm font-black text-zinc-950"
            >
              Número de personas
            </label>

            <div className="mt-3 flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
              <button
                type="button"
                onClick={() =>
                  setPortions((current) =>
                    Math.max(1, current - 1)
                  )
                }
                aria-label="Disminuir número de personas"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-black text-zinc-700 shadow-sm transition hover:bg-zinc-200"
              >
                −
              </button>

              <div className="text-center">
                <input
                  id="chef-portions"
                  type="number"
                  min={1}
                  max={20}
                  value={portions}
                  onChange={(event) =>
                    setPortions(
                      Math.min(
                        Math.max(
                          Number(event.target.value) ||
                            1,
                          1
                        ),
                        20
                      )
                    )
                  }
                  className="w-20 bg-transparent text-center text-2xl font-black text-zinc-950 outline-none"
                />

                <p className="text-xs font-bold text-zinc-400">
                  personas
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPortions((current) =>
                    Math.min(20, current + 1)
                  )
                }
                aria-label="Aumentar número de personas"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600 text-xl font-black text-white shadow-sm transition hover:bg-green-700"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="chef-budget"
              className="text-sm font-black text-zinc-950"
            >
              Presupuesto máximo
              <span className="ml-2 font-semibold text-zinc-400">
                Opcional
              </span>
            </label>

            <div className="mt-3 flex min-h-[60px] items-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 transition focus-within:border-green-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-green-100">
              <span className="flex h-full items-center border-r border-zinc-200 px-5 text-lg font-black text-green-700">
                $
              </span>

              <input
                id="chef-budget"
                type="number"
                min="0"
                step="0.01"
                value={maximumBudget}
                onChange={(event) => {
                  setMaximumBudget(
                    event.target.value
                  );
                  setError("");
                }}
                placeholder="Ejemplo: 15.00"
                className="min-w-0 flex-1 bg-transparent px-4 py-4 text-base font-black text-zinc-950 outline-none placeholder:font-medium placeholder:text-zinc-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-7">
          <p className="text-sm font-black text-zinc-950">
            Preferencias alimentarias
            <span className="ml-2 font-semibold text-zinc-400">
              Opcional
            </span>
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {dietaryOptions.map((option) => {
              const selected =
                dietaryPreferences.includes(
                  option.value
                );

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    toggleDietaryPreference(
                      option.value
                    )
                  }
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-black transition ${
                    selected
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      selected
                        ? "bg-white/20"
                        : "bg-zinc-100"
                    }`}
                  >
                    {selected && (
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          d="m5 10 3 3 7-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>

                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />

                <path
                  d="M12 8v5M12 17h.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <div>
              <p className="font-black text-amber-900">
                No fue posible completar la consulta
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                {error}
              </p>

              {error
                .toLowerCase()
                .includes("recetas") && (
                <p className="mt-2 text-xs font-semibold text-amber-700">
                  Chef MercaNova GO v2 requiere que las tablas de recetas estén creadas en Supabase.
                </p>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-green-600 px-6 py-5 text-base font-black text-white shadow-lg shadow-green-900/20 transition hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none sm:text-lg"
        >
          {loading ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Analizando tu consulta...
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path
                  d="M12 3.75 14.15 8l4.7 1.15-3.4 3.3.8 4.65L12 14.9l-4.25 2.2.8-4.65-3.4-3.3L9.85 8 12 3.75Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M18.5 3.75v3M20 5.25h-3M5.25 16.75v3M6.75 18.25h-3"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>

              Consultar a Chef MercaNova GO
            </>
          )}
        </button>
      </form>

      {response && (
        <div className="border-t border-zinc-200 bg-[#f4f7f4] p-5 sm:p-8">
          <div className="mb-6 rounded-3xl border border-green-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-6 w-6"
                  >
                    <path
                      d="M7.75 18.25 4 20l1-4.1A8 8 0 1 1 7.75 18.25Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M8.5 9.25h7M8.5 12.5h5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
                    Respuesta del asistente
                  </p>

                  <h3 className="mt-2 text-xl font-black text-zinc-950">
                    {response.message}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-zinc-100 px-3 py-2 text-xs font-black text-zinc-600">
                  {getIntentLabel(
                    response.interpretation.intent
                  )}
                </span>

                <span className="rounded-full bg-green-50 px-3 py-2 text-xs font-black text-green-700">
                  {
                    response.interpretation
                      .requested_portions
                  }{" "}
                  personas
                </span>
              </div>
            </div>
          </div>

          {response.primary_recommendation && (
            <ChefRecommendationCard
              recommendation={
                response.primary_recommendation
              }
              primary
            />
          )}

          {response.recommendations.length > 1 && (
            <div className="mt-8">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-green-600">
                Otras opciones
              </p>

              <h3 className="mt-2 text-2xl font-black text-zinc-950">
                Recetas relacionadas
              </h3>

              <div className="mt-5 grid gap-6">
                {response.recommendations
                  .slice(1)
                  .map((recommendation) => (
                    <ChefRecommendationCard
                      key={
                        recommendation.recipe.id
                      }
                      recommendation={
                        recommendation
                      }
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}