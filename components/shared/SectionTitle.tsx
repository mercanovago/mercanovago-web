interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export default function SectionTitle({
  eyebrow,
  title,
  description,
}: SectionTitleProps) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="mb-2 text-sm font-black uppercase tracking-wide text-green-600">
          {eyebrow}
        </p>
      )}

      <h2 className="text-3xl font-black text-zinc-950 sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-3 max-w-2xl text-base text-zinc-500 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}