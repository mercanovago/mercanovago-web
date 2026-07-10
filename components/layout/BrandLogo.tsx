type BrandLogoSize = "sm" | "md" | "lg" | "xl";
type BrandLogoTheme = "light" | "dark";

interface BrandLogoProps {
  size?: BrandLogoSize;
  theme?: BrandLogoTheme;
  showTagline?: boolean;
  compact?: boolean;
  className?: string;
}

const sizeStyles: Record<
  BrandLogoSize,
  {
    icon: string;
    merca: string;
    nova: string;
    go: string;
    tagline: string;
    gap: string;
  }
> = {
  sm: {
    icon: "h-9 w-9",
    merca: "text-xl",
    nova: "text-xl",
    go: "px-2 py-0.5 text-[8px]",
    tagline: "text-[7px] tracking-[0.18em]",
    gap: "gap-2",
  },
  md: {
    icon: "h-11 w-11",
    merca: "text-2xl",
    nova: "text-2xl",
    go: "px-2.5 py-1 text-[9px]",
    tagline: "text-[8px] tracking-[0.2em]",
    gap: "gap-2.5",
  },
  lg: {
    icon: "h-14 w-14",
    merca: "text-3xl",
    nova: "text-3xl",
    go: "px-3 py-1 text-[10px]",
    tagline: "text-[9px] tracking-[0.22em]",
    gap: "gap-3",
  },
  xl: {
    icon: "h-16 w-16",
    merca: "text-4xl",
    nova: "text-4xl",
    go: "px-3.5 py-1.5 text-xs",
    tagline: "text-[10px] tracking-[0.24em]",
    gap: "gap-3.5",
  },
};

export default function BrandLogo({
  size = "md",
  theme = "light",
  showTagline = true,
  compact = false,
  className = "",
}: BrandLogoProps) {
  const styles = sizeStyles[size];

  const primaryTextColor =
    theme === "dark" ? "text-white" : "text-zinc-950";

  const secondaryTextColor =
    theme === "dark" ? "text-zinc-300" : "text-zinc-500";

  return (
    <div
      className={`inline-flex items-center ${styles.gap} ${className}`}
      aria-label="MercaNova GO"
    >
      {!compact && (
        <div
          className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-green-500 via-green-600 to-emerald-800 text-white shadow-[0_12px_30px_-12px_rgba(22,163,74,0.8)] ${styles.icon}`}
          aria-hidden="true"
        >
          <div className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-white/20 blur-md" />

          <svg
            viewBox="0 0 64 64"
            fill="none"
            className="relative h-[72%] w-[72%]"
          >
            <path
              d="M14 23.5h7.5l3.6 18.2a4 4 0 0 0 3.9 3.2h16.1a4 4 0 0 0 3.9-3.1l3.1-13.3H23.2"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M31 24.5c1.2-7.7 6.6-12.6 15.5-14.3-.3 8.5-4.9 13.4-13.7 14.8"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M32 25c-1.7-6-6-9.2-12.9-9.7.9 6.4 4.8 9.9 11.7 10.4"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <circle cx="30" cy="52" r="3.5" fill="currentColor" />
            <circle cx="46" cy="52" r="3.5" fill="currentColor" />
          </svg>
        </div>
      )}

      <div className="min-w-0 leading-none">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span
            className={`font-black tracking-[-0.055em] ${primaryTextColor} ${styles.merca}`}
          >
            Merca
          </span>

          <span
            className={`font-black tracking-[-0.055em] text-green-600 ${styles.nova}`}
          >
            Nova
          </span>

          <span
            className={`inline-flex shrink-0 items-center justify-center rounded-full bg-green-600 font-black italic uppercase tracking-[0.12em] text-white shadow-sm shadow-green-900/20 ${styles.go}`}
          >
            GO
          </span>
        </div>

        {showTagline && (
          <p
            className={`mt-1.5 whitespace-nowrap font-extrabold uppercase ${secondaryTextColor} ${styles.tagline}`}
          >
            Tu mercado más cerca
          </p>
        )}
      </div>
    </div>
  );
}