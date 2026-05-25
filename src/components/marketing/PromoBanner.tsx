"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { PROMO_BANNER_STORAGE_KEY } from "@/lib/marketing";

type PromoBannerProps = {
  className?: string;
};

export function PromoBanner({ className = "" }: PromoBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(PROMO_BANNER_STORAGE_KEY);
      if (!dismissed) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(PROMO_BANNER_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <section
      role="region"
      aria-label="Акция для специалистов"
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-4 text-white shadow-lg shadow-emerald-900/15 sm:px-6 sm:py-5 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:pr-10">
        <p className="text-sm font-medium leading-snug sm:text-base">
          Первые 10 специалистов Москвы — размещение 0% комиссии на 2 месяца
        </p>
        <Link
          href="/for-business"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
        >
          Стать партнёром
        </Link>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-white/90 transition hover:bg-white/20 hover:text-white"
        aria-label="Закрыть баннер"
      >
        <X className="h-5 w-5" aria-hidden />
      </button>
    </section>
  );
}
