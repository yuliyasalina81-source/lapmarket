"use client";

/** Client Component */
/** Баннер установки PWA на устройство */

import { useEffect, useState } from "react";

/**
 * Приглашение добавить приложение на главный экран
 */
export function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const dismissed = localStorage.getItem("pwa-dismissed");
    if (isMobile && !dismissed && !window.matchMedia("(display-mode: standalone)").matches) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <p className="text-sm font-medium text-stone-900">Установите ЛапМаркет</p>
      <p className="mt-1 text-xs text-stone-600">
        Добавьте на главный экран через меню браузера «На экран Домой»
      </p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem("pwa-dismissed", "1");
          setShow(false);
        }}
        className="mt-3 text-xs font-semibold text-emerald-700"
      >
        Понятно
      </button>
    </div>
  );
}
