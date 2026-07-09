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
  const [portions, setPortions] = useState(4);

  const estimatedCost = products.reduce(
    (sum, product) => sum + Number(product.price ?? 0),
    0
  );

  const costByPortion = portions > 0 ? estimatedCost / portions : 0;

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

  function decreasePortions() {
    if (portions > 2) {
      setPortions(portions - 2);
    }
  }

  function increasePortions() {
    if (portions < 10) {
      setPortions(portions + 2);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl sm:p-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-green-600">
            Cocina fácil con MercaNova
          </p>

          <h2 className="mt-2 text-3xl font-black">
            ¿Qué deseas cocinar hoy?
          </h2>

          <p className="mt-2 max-w-2xl text-zinc-500">
            Elige una receta y arma tu compra completa en segundos.
          </p>
        </div>

        <div className="rounded-2xl bg-green-50 px-5 py-3">
          <p className="text-xs font-black uppercase text-green-700">
            Compra guiada
          </p>
          <p className="font-black text-green-600">Ingredientes al carrito</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
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
            className="rounded-full bg-zinc-100 px-5 py-3 font-black transition hover:bg-green-100 hover:text-green-700"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row">
        <input
          value={recipe}
          onChange={(e) => setRecipe(e.target.value)}
          placeholder="Ejemplo: quiero preparar locro de papa para mi familia..."
          className="flex-1 rounded-2xl border border-zinc-300 p-5 font-bold outline-none focus:border-green-600"
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          className="rounded-2xl bg-green-600 px-10 py-5 font-black text-white transition hover:bg-green-700 disabled:bg-zinc-300"
        >
          {loading ? "Buscando..." : "Buscar receta"}
        </button>
      </div>

      {showRecipe && (
        <section className="mt-10 overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-50 shadow-sm">
          <div className="grid lg:grid-cols-2">
            <div className="bg-gradient-to-br from-green-900 via-green-700 to-black p-8 text-white">
              <p className="text-sm font-black uppercase tracking-widest text-green-300">
                Receta recomendada
              </p>

              <h3 className="mt-3 text-5xl font-black leading-tight">
                Locro de papa
              </h3>

              <p className="mt-4 max-w-xl text-white/80">
                Una preparación tradicional, cremosa y familiar. Ideal para
                compartir en casa con ingredientes frescos de MercaNova GO.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-white/10 px-4 py-2 font-bold">
                  ⭐ 4.9
                </span>

                <span className="rounded-full bg-white/10 px-4 py-2 font-bold">
                  🍲 Tradicional
                </span>

                <span className="rounded-full bg-white/10 px-4 py-2 font-bold">
                  👨‍👩‍👧 Familiar
                </span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-xs font-black uppercase text-green-200">
                    Tiempo
                  </p>
                  <p className="mt-2 text-2xl font-black">45 min</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-xs font-black uppercase text-green-200">
                    Dificultad
                  </p>
                  <p className="mt-2 text-2xl font-black">Fácil</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-xs font-black uppercase text-green-200">
                    Costo estimado
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    ${estimatedCost.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-xs font-black uppercase text-green-200">
                    Por porción
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    ${costByPortion.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase text-zinc-500">
                      Porciones
                    </p>
                    <h4 className="mt-1 text-3xl font-black">
                      {portions} personas
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={decreasePortions}
                      className="h-11 w-11 rounded-full bg-zinc-100 text-2xl font-black hover:bg-zinc-200"
                    >
                      -
                    </button>

                    <button
                      onClick={increasePortions}
                      className="h-11 w-11 rounded-full bg-green-600 text-2xl font-black text-white hover:bg-green-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <h4 className="mt-8 text-2xl font-black">
                Ingredientes para tu receta
              </h4>

              <div className="mt-4 grid gap-4">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-20 w-20 rounded-2xl object-cover"
                    />

                    <div className="flex-1">
                      <p className="text-lg font-black">{product.name}</p>
                      <p className="text-sm text-zinc-500">{product.unit}</p>

                      <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                        Disponible
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-black text-green-600">
                        ${Number(product.price).toFixed(2)}
                      </p>

                      <button
                        onClick={() =>
                          addToCart({
                            id: product.id,
                            name: product.name,
                            image: product.image,
                            price: Number(product.price),
                            unit: product.unit,
                          })
                        }
                        className="mt-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-black text-white hover:bg-zinc-700"
                      >
                        Agregar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 bg-white p-8">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl bg-zinc-50 p-6">
                <p className="text-sm font-black uppercase text-green-600">
                  Valor nutricional estimado
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold">
                  <p>🔥 Calorías</p>
                  <p className="text-right">380 kcal</p>

                  <p>🥔 Carbohidratos</p>
                  <p className="text-right">52 g</p>

                  <p>🧀 Proteína</p>
                  <p className="text-right">14 g</p>

                  <p>🥑 Grasas</p>
                  <p className="text-right">12 g</p>
                </div>
              </div>

              <div className="rounded-3xl bg-zinc-50 p-6">
                <p className="text-sm font-black uppercase text-green-600">
                  Preparación rápida
                </p>

                <ol className="mt-4 space-y-2 text-sm font-bold text-zinc-700">
                  <li>1. Cocina la papa hasta suavizar.</li>
                  <li>2. Sofríe cebolla y mezcla con la papa.</li>
                  <li>3. Agrega leche o queso fresco.</li>
                  <li>4. Sirve con aguacate.</li>
                </ol>
              </div>

              <div className="rounded-3xl bg-zinc-50 p-6">
                <p className="text-sm font-black uppercase text-green-600">
                  Sugerencias
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {["Ají", "Cilantro", "Pan", "Leche", "Crema"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white px-4 py-2 text-sm font-black shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {added && (
              <div className="mt-6 rounded-2xl bg-green-100 p-5 text-center font-black text-green-700">
                ✅ Ingredientes agregados correctamente a tu canasta.
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 md:flex-row">
              <button
                onClick={addRecipeToCart}
                disabled={loading || products.length === 0}
                className="flex-1 rounded-2xl bg-green-600 px-8 py-5 text-xl font-black text-white hover:bg-green-700 disabled:bg-zinc-300"
              >
                Agregar TODOS los ingredientes al carrito
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
        </section>
      )}
    </div>
  );
}