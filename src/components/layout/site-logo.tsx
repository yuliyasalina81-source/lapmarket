"use client";

/** Горизонтальный логотип LAPMARKET (PNG, прозрачный фон) */

import Image from "next/image";
import Link from "next/link";

const LOGO_VERSION = "2";
const LOGO_SRC = `/logo-brand.png?v=${LOGO_VERSION}`;
const LOGO_WIDTH = 670;
const LOGO_HEIGHT = 373;

type SiteLogoProps = {
  linked?: boolean;
  variant?: "header" | "footer";
  className?: string;
};

/**
 * Логотип целиком, без обрезки (object-contain).
 * В шапке — максимум внутри текущей высоты navbar (шапку не трогаем).
 */
export function SiteLogo({
  linked = true,
  variant = "header",
  className = "",
}: SiteLogoProps) {
  const isFooter = variant === "footer";

  const maxHeight = isFooter
    ? "max-h-[16rem] sm:max-h-[18rem]"
    : "max-h-[7.1rem] sm:max-h-[8.65rem]";
  const boxHeight = isFooter
    ? "h-[16rem] sm:h-[18rem]"
    : "h-[7.1rem] sm:h-[8.65rem]";
  const maxWidth = isFooter
    ? "max-w-[min(1200px,100vw)] sm:max-w-[1400px]"
    : "max-w-[min(780px,98vw)] sm:max-w-[920px]";

  const image = (
    <span className={`inline-flex ${boxHeight} max-w-full items-center ${className}`}>
      <Image
        src={LOGO_SRC}
        alt="ЛапМаркет — здоровье, любовь, забота"
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        unoptimized
        className={`h-full w-auto ${maxHeight} ${maxWidth} object-contain object-left`}
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
      className={`inline-flex shrink-0 transition hover:opacity-90 ${
        isFooter
          ? "max-w-[min(1200px,100vw)] sm:max-w-[1400px]"
          : "max-w-[min(920px,98vw)]"
      }`}
      aria-label="ЛапМаркет — на главную"
    >
      {image}
    </Link>
  );
}
