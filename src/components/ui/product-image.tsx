/** Server Component */
/** Изображение товара с fallback */

import Image from "next/image";

/**
 * Оптимизированное фото товара через next/image
 */
export function ProductImage({
  src,
  alt,
  className = "",
  fill = false,
  width,
  height,
}: {
  src: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-stone-100 text-4xl ${className}`}
      >
        🐾
      </div>
    );
  }

  if (fill) {
    return (
      <Image src={src} alt={alt} fill className={`object-cover ${className}`} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      className={`object-cover ${className}`}
    />
  );
}
