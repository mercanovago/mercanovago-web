const benefits = [
  ["Entrega rápida", "Recibe tus productos el mismo día."],
  ["Productos seleccionados", "Elegimos como si fuera para nuestra familia."],
  ["Pago flexible", "Efectivo o transferencia."],
  ["Cobertura local", "Riobamba y sectores cercanos."],
];

export default function Benefits() {
  return (
    <section className="bg-white text-black py-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-5">
        {benefits.map((item) => (
          <div key={item[0]} className="rounded-3xl border border-zinc-200 p-6">
            <h3 className="text-xl font-black text-green-700">{item[0]}</h3>
            <p className="text-zinc-600 mt-2">{item[1]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}