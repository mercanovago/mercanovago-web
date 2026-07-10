"use client";

const categories = [
  {
    name: "Frutas",
    label: "Frescura natural",
    image:
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Hortalizas",
    label: "Selección diaria",
    image:
      "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Tubérculos",
    label: "Base de tu cocina",
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Lácteos",
    label: "Calidad para el hogar",
    image:
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Abarrotes",
    label: "Compra completa",
    image:
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Limpieza",
    label: "Hogar impecable",
    image:
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=900&auto=format&fit=crop",
  },
];

export default function Categories() {
  return (
    <section id="catalogo" className="bg-zinc-950 py-16 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-green-400">
              Catálogo MercaNova
            </p>

            <h2 className="mt-2 text-4xl font-black">
              Compra por categoría
            </h2>
          </div>

          <p className="max-w-md text-zinc-400">
            Productos organizados para que encuentres rápido lo que necesitas
            para tu hogar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category.name}
              className="group relative h-56 overflow-hidden rounded-[2rem] bg-zinc-900 text-left shadow-xl"
            >
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-3xl font-black text-white">
                  {category.name}
                </p>

                <p className="mt-1 font-bold text-green-300">
                  {category.label}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}