export default function Offers() {
  return (
    <section className="bg-white text-black py-8">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-gradient-to-br from-green-700 to-green-950 text-white p-8">
          <h3 className="text-3xl font-black">Combo Familiar</h3>
          <p className="text-green-200 mt-2">Canasta semanal para el hogar</p>
          <p className="text-5xl font-black mt-6">$25</p>
        </div>

        <div className="rounded-3xl bg-zinc-950 text-white p-8">
          <h3 className="text-3xl font-black">Oferta semanal</h3>
          <p className="text-zinc-300 mt-2">Ahorra en productos seleccionados</p>
          <p className="text-5xl font-black text-green-400 mt-6">10%</p>
        </div>

        <div className="rounded-3xl bg-green-600 text-white p-8">
          <h3 className="text-3xl font-black">App instalable</h3>
          <p className="mt-2">Próximamente desde mercanovago.com</p>
          <p className="text-5xl font-black mt-6">QR</p>
        </div>
      </div>
    </section>
  );
}