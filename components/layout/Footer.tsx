export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-400 py-8">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-6">
        <div>
          <h3 className="text-white text-2xl font-black">
            Merca<span className="text-green-500">Nova</span> GO
          </h3>
          <p>De la huerta a tu hogar.</p>
        </div>
        <p>📍 Riobamba y sectores cercanos</p>
        <p>📲 WhatsApp 0983170593</p>
        <p>🕗 Atención 8:00 a 18:00</p>
      </div>
    </footer>
  );
}