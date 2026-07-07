interface StockBadgeProps {
  stock: boolean;
}

export default function StockBadge({ stock }: StockBadgeProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        stock
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-600"
      }`}
    >
      {stock ? "Disponible" : "Agotado"}
    </span>
  );
}