interface PriceProps {
  price: number;
  oldPrice?: number;
  size?: "sm" | "md" | "lg";
}

export default function Price({
  price,
  oldPrice,
  size = "md",
}: PriceProps) {
  const discount =
    oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  const sizes = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  return (
    <div>
      {oldPrice && oldPrice > price && (
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-400 line-through">
            ${oldPrice.toFixed(2)}
          </span>

          <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-black text-red-600">
            -{discount}%
          </span>
        </div>
      )}

      <p className={`${sizes[size]} font-black text-zinc-950`}>
        ${price.toFixed(2)}
      </p>
    </div>
  );
}