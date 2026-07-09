"use client";

import { useState } from "react";

export default function ChefSearch() {

  const [recipe, setRecipe] = useState("");

  function handleSearch() {
    alert("Muy pronto la IA preparará: " + recipe);
  }

  return (

    <div className="rounded-3xl bg-white p-10 shadow-xl">

      <h2 className="text-3xl font-black">
        ¿Qué deseas cocinar hoy?
      </h2>

      <p className="mt-2 text-zinc-500">
        Ejemplo:
      </p>

      <div className="mt-4 flex flex-wrap gap-3">

        <button className="rounded-full bg-zinc-100 px-5 py-2 font-bold">
          Locro de papa
        </button>

        <button className="rounded-full bg-zinc-100 px-5 py-2 font-bold">
          Fanesca
        </button>

        <button className="rounded-full bg-zinc-100 px-5 py-2 font-bold">
          Encebollado
        </button>

        <button className="rounded-full bg-zinc-100 px-5 py-2 font-bold">
          Hornado
        </button>

      </div>

      <div className="mt-8 flex gap-4">

        <input
          value={recipe}
          onChange={(e)=>setRecipe(e.target.value)}
          placeholder="Ejemplo: Quiero preparar un locro de papas para 6 personas..."
          className="flex-1 rounded-2xl border p-5"
        />

        <button
          onClick={handleSearch}
          className="rounded-2xl bg-green-600 px-8 font-black text-white hover:bg-green-700"
        >
          Buscar
        </button>

      </div>

    </div>

  );

}