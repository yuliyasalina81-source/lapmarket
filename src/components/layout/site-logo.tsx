"use client";

/** Полный логотип LAPMARKET (иконка + название + слоган) */

import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/logo.png";

type SiteLogoProps = {
  /** Высота логотипа в px */
  height?: number;
  /** Оборачивать в ссылку на главную */
  linked?: boolean;
  className?: string;
};

/**
 * Фирменный логотип сайта (изображение целиком, без дублирования текста)
 */
export function SiteLogo({
  height = 44,
  linked = true,
  className = "",
}: SiteLogoProps) {
  const image = (
    <Image
      src={LOGO_SRC}
      alt="ЛапМаркет — здоровье, любовь, забота"
      width={Math.round(height * 2.8)}
      height={height}
      className={`w-auto shrink-0 object-contain object-left ${className}`}
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
