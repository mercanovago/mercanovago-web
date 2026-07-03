export default function Header() {
  return (
    <header className="bg-black border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-black">
            Merca<span className="text-green-500">Nova</span>
          </h1>

          <p className="text-green-500 italic font-bold">
            GO
          </p>
        </div>

        <div className="hidden lg:flex gap-8 font-semibold text-zinc-300">

          <button className="hover:text-green-400">
            Inicio
          </button>

          <button className="hover:text-green-400">
            Categorías
          </button>

          <button className="hover:text-green-400">
            Ofertas
          </button>

          <button className="hover:text-green-400">
            Contacto
          </button>

        </div>

        <button className="bg-green-600 hover:bg-green-500 transition px-5 py-3 rounded-xl font-bold">
          🛒 Mi canasta
        </button>

      </div>
    </header>
  )
}