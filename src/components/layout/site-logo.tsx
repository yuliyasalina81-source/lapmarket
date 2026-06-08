"use client";

/** Логотип сайта (временно — PWA-иконка) */

import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/icon-192.png";

type SiteLogoProps = {
  /** Оборачивать в ссылку на главную */
  linked?: boolean;
  /** max-h-8 в шапке, max-h-10 в подвале */
  variant?: "header" | "footer";
  className?: string;
};

/**
 * Фирменный логотип без обрезки (object-contain)
 */
export function SiteLogo({
  linked = true,
  variant = "header",
  className = "",
}: SiteLogoProps) {
  const maxHeight = variant === "footer" ? "max-h-10" : "max-h-8";
  const boxHeight = variant === "footer" ? "h-10" : "h-8";

  const image = (
    <span className={`inline-flex ${boxHeight} items-center ${className}`}>
      <Image
        src={LOGO_SRC}
        alt="ЛапМаркет — здоровье, любовь, забота"
        width={192}
        height={192}
        className={`object-contain w-auto h-full ${maxHeight}`}
        priority
      />
    </span>
  );

  if (!linked) {
    return image;
  }

  return (
    <Link
      href="/"
      className="inline-flex shrink-0 transition hover:opacity-90"
      aria-label="ЛапМаркет — на главную"
    >
      {image}
    </Link>
  );
}
