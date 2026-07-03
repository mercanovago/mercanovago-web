export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">

        {/* Logo */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-black">
            <span className="text-black">Merca</span>
            <span className="text-green-600">Nova</span>
          </h1>

          <span className="text-green-600 font-bold italic">
            GO
          </span>
        </div>

        {/* Buscador */}
        <div className="flex-1 hidden lg:flex">
          <input
            type="text"
            placeholder="¿Qué producto estás buscando?"
            className="w-full rounded-l-xl border border-zinc-300 px-5 py-3 outline-none"
          />

          <button className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-r-xl font-bold">
            Buscar
          </button>
        </div>

        {/* Menú */}
        <div className="hidden xl:flex gap-8 font-semibold text-zinc-700">
          <button>Inicio</button>
          <button>Categorías</button>
          <button>Ofertas</button>
          <button>Combos</button>
          <button>Nosotros</button>
          <button>Contacto</button>
        </div>

        {/* Carrito */}
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold">
          🛒 Mi canasta
        </button>

      </div>
    </nav>
  );
}