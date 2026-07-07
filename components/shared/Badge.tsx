import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?:
    | "success"
    | "offer"
    | "new"
    | "warning"
    | "dark"
    | "info";
  className?: string;
}

export default function Badge({
  children,
  variant = "success",
  className = "",
}: BadgeProps) {
  const variants = {
    success: "bg-green-600 text-white",

    offer: "bg-red-600 text-white",

    new: "bg-blue-600 text-white",

    warning: "bg-yellow-400 text-black",

    dark: "bg-zinc-900 text-white",

    info: "bg-zinc-200 text-zinc-700",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-xs
        font-black
        tracking-wide
        shadow-sm
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}