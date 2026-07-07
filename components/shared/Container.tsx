import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div
      className={`
        mx-auto
        w-full
        max-w-[1500px]
        px-4
        sm:px-6
        lg:px-10
        xl:px-14
        2xl:px-16
        ${className}
      `}
    >
      {children}
    </div>
  );
}