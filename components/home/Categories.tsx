const categories = [
  { name: "Frutas", image: "🍎" },
  { name: "Hortalizas", image: "🥬" },
  { name: "Tubérculos", image: "🥔" },
  { name: "Lácteos", image: "🥛" },
  { name: "Abarrotes", image: "🛒" },
  { name: "Limpieza", image: "🧼" },
];

export default function Categories() {
  return (
    <section className="bg-white text-black py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-5">
          {categories.map((category) => (
            <button
              key={category.name}
              className="rounded-3xl border border-zinc-200 bg-white p-5 text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-4xl">
                {category.image}
              </div>
              <p className="font-black">{category.name}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}