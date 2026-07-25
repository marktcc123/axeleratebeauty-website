import Image, { type ImageProps } from "next/image";

type MediaProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
};

/** Optimized image wrapper for section photography. */
export function Media({
  src,
  alt,
  width,
  height,
  className,
  imgClassName = "object-cover",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 960px",
  fill = false,
}: MediaProps) {
  if (fill) {
    return (
      <div className={`relative overflow-hidden ${className ?? ""}`}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={imgClassName}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <Image
        src={src}
        alt={alt}
        width={width ?? 1600}
        height={height ?? 900}
        priority={priority}
        sizes={sizes}
        className={`h-auto w-full ${imgClassName}`}
      />
    </div>
  );
}

export type { ImageProps };
