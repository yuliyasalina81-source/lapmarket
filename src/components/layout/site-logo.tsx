"use client";

/** Горизонтальный логотип LAPMARKET (SVG) */

import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/logo.svg";

type SiteLogoProps = {
  /** Высота логотипа в px (32 — шапка, 40 — подвал) */
  height?: number;
  /** Оборачивать в ссылку на главную */
  linked?: boolean;
  className?: string;
};

/**
 * Фирменный логотип сайта
 */
export function SiteLogo({
  height = 32,
  linked = true,
  className = "",
}: SiteLogoProps) {
  const width = Math.round(height * (300 / 48));

  const image = (
    <Image
      src={LOGO_SRC}
      alt="ЛапМаркет — здоровье, любовь, забота"
      width={width}
      height={height}
      className={`shrink-0 object-contain object-left ${className}`}
      style={{ height: `${height}px`, width: "auto" }}
      priority
    />
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
