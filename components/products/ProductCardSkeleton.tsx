import Skeleton from "../shared/Skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">

      <Skeleton className="h-52 w-full rounded-2xl" />

      <div className="mt-4">

        <Skeleton className="mb-2 h-4 w-20" />

        <Skeleton className="mb-3 h-8 w-44" />

        <Skeleton className="mb-2 h-4 w-40" />

        <Skeleton className="mb-5 h-4 w-32" />

        <Skeleton className="h-12 w-full rounded-xl" />

      </div>

    </div>
  );
}