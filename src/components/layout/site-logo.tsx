"use client";

/** Логотип ЛапМаркет (сердце + лапа) */

import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/logo.png";

type SiteLogoProps = {
  /** С текстом «ЛапМаркет» рядом */
  showText?: boolean;
  /** Размер иконки в px */
  size?: number;
  /** Оборачивать в ссылку на главную */
  linked?: boolean;
  className?: string;
};

/**
 * Фирменный логотип сайта
 */
export function SiteLogo({
  showText = true,
  size = 40,
  linked = true,
  className = "",
}: SiteLogoProps) {
  const image = (
    <Image
      src={LOGO_SRC}
      alt="ЛапМаркет"
      width={size}
      height={size}
      className="shrink-0 rounded-2xl object-contain"
      priority
    />
  );

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {image}
      {showText && (
        <span className="text-lg font-bold tracking-tight text-stone-900">
          Лап<span className="text-emerald-600">Маркет</span>
        </span>
      )}
    </span>
  );

  if (!linked) {
    return content;
  }

  return (
    <Link
      href="/"
      className="transition hover:opacity-90"
      aria-label="ЛапМаркет — на главную"
    >
      {content}
    </Link>
  );
}
