type LogoProps = {
  variant?: "gold" | "dark";
  className?: string;
  priority?: boolean;
};

const srcByVariant = {
  gold: "/images/dermabell-logo.png",
  dark: "/images/dermabell-logo-dark.png",
} as const;

export function Logo({ variant = "dark", className = "h-7 w-auto sm:h-8", priority = false }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={srcByVariant[variant]}
      alt="Dermabell."
      width={600}
      height={91}
      className={className}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}
