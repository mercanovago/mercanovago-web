interface DeliveryBadgeProps {
  delivery: string;
}

export default function DeliveryBadge({
  delivery,
}: DeliveryBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
      <span>🚚</span>
      <span>Entrega: {delivery}</span>
    </div>
  );
}