"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/cart/CartContext";
import { getLocroRecipeProducts } from "@/services/chefRecipes";

interface ChefProduct {
  id: number;
  name: string;
  image: string;
  price: number;
  unit: string;
}

export default function ChefSearch() {
  const { addToCart } = useCart();

  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRecipe, setShowRecipe] = useState(false);
  const [products, setProducts] = useState<ChefProduct[]>([]);
  const [added, setAdded] = useState(false);

  const estimatedCost = products.reduce(
    (sum, product) => sum + Number(product.price ?? 0),
    0
  );

  async function loadLocroRecipe() {
    setLoading(true);
    setAdded(false);

    try {
      const data = await getLocroRecipeProducts();
      setProducts(data as ChefProduct[]);
      setShowRecipe(true);
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar la receta.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!recipe.trim()) {
      alert("Escribe una receta o selecciona una sugerencia.");
      return;
    }

    await loadLocroRecipe();
  }

  function addRecipeToCart() {
    if (products.length === 0) {
      alert("Primero carga la receta.");
      return;
    }

    products.forEach((product) => {
      addToCart({
        id: product.id,
        name: product.name,
        image: product.image,
        price: Number(product.price),
        unit: product.unit,
      });
    });

    setAdded(true);
  }

  return (
    <div className="rounded-3xl bg-white p-10 shadow-xl">
      <h2 className="text-3xl font-black">¿Qué deseas cocinar hoy?</h2>

      <p className="mt-2 text-zinc-500">Ejemplo:</p>

      <div className="mt-4 flex flex-wrap gap-3">
        {["Locro de papa", "Fanesca", "Encebollado", "Hornado"].map((item) => (
          <button
            key={item}
            onClick={() => {
              setRecipe(item);
              if (item === "Locro de papa") {
                loadLocroRecipe();
              } else {
                setShowRecipe(false);
                setProducts([]);
                alert("Muy pronto tendremos esta receta disponible.");
              }
            }}
            className="rounded-full bg-zinc-100 px-5 py-2 font-bold hover:bg-green-100"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row">
        <input
          value={recipe}
          onChange={(e) => setRecipe(e.target.value)}
          placeholder="Ejemplo: Quiero preparar un locro de papas para 6 personas..."
          className="flex-1 rounded-2xl border p-5"
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          className="rounded-2xl bg-green-600 px-8 py-5 font-black text-white hover:bg-green-700 disabled:bg-zinc-300"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {showRecipe && (
        <div className="mt-10 rounded-3xl border bg-zinc-50 p-8">
          <p className="text-sm font-black uppercase tracking-widest text-green-600">
            Receta sugerida
          </p>

          <h3 className="mt-2 text-4xl font-black">Locro de papa</h3>

          <p className="mt-3 text-zinc-600">
            Plato tradicional ecuatoriano, ideal para una comida familiar.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase text-zinc-500">
                Tiempo
              </p>
              <p className="mt-2 text-2xl font-black">45 min</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase text-zinc-500">
                Porciones
              </p>
              <p className="mt-2 text-2xl font-black">4 a 6</p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase text-zinc-500">
                Dificultad
              </p>
              <p className="mt-2 text-2xl font-black text-green-600">Fácil</p>
            </div>

            <div className="rounded-2xl bg-green-50 p-5 shadow-sm">
              <p className="text-xs font-black uppercase text-green-700">
                Costo estimado
              </p>
              <p className="mt-2 text-2xl font-black text-green-600">
                ${estimatedCost.toFixed(2)}
              </p>
            </div>
          </div>

          <h4 className="mt-8 text-2xl font-black">
            Ingredientes encontrados
          </h4>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-black">{product.name}</p>
                  <p className="text-sm text-zinc-500">{product.unit}</p>
                </div>

                <p className="font-black text-green-600">
                  ${Number(product.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {added && (
            <div className="mt-6 rounded-2xl bg-green-100 p-5 font-black text-green-700">
              ✅ Ingredientes agregados correctamente a tu canasta.
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4 md:flex-row">
            <button
              onClick={addRecipeToCart}
              disabled={loading || products.length === 0}
              className="flex-1 rounded-2xl bg-green-600 px-8 py-5 text-xl font-black text-white hover:bg-green-700 disabled:bg-zinc-300"
            >
              Agregar receta a mi canasta
            </button>

            {added && (
              <Link
                href="/checkout"
                className="flex-1 rounded-2xl bg-zinc-900 px-8 py-5 text-center text-xl font-black text-white hover:bg-zinc-800"
              >
                Ver mi canasta
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}