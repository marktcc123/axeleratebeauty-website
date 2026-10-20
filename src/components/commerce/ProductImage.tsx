import Image from "next/image";

/**
 * Stable commerce image frame. Empty sources use a neutral “No image” plate —
 * never a stock pack shot that could be mistaken for this SKU.
 */
export function ProductImage({
  src,
  alt,
  sizes = "96px",
  priority = false,
  className = "",
  ratio = "square",
}: {
  src: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  ratio?: "square" | "portrait";
}) {
  const frame = ratio === "portrait" ? "aspect-[4/5]" : "aspect-square";

  if (!src) {
    return (
      <div
        className={`flex ${frame} w-full items-center justify-center bg-sand-100 text-center ${className}`}
        aria-label={`${alt} — no image`}
      >
        <span className="px-2 text-[10px] uppercase tracking-[0.14em] text-muted">No image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-sand-100 ${frame} w-full ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-contain p-1"
      />
    </div>
  );
}
