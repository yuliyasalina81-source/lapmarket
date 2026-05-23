"use client";

import { useEffect, useState } from "react";

/**
 * Shows a reload prompt when the page fails to hydrate or the network drops (common on mobile).
 */
export function MobileFallback() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile) return;

    const onOffline = () => setShow(true);
    const onOnline = () => setShow(false);

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    if (!navigator.onLine) {
      setShow(true);
    }

    const chunkRecovery = (event: ErrorEvent) => {
      const msg = event.message ?? "";
      if (
        msg.includes("ChunkLoadError") ||
        msg.includes("Loading chunk") ||
        msg.includes("Failed to fetch dynamically imported module")
      ) {
        setShow(true);
      }
    };

    window.addEventListener("error", chunkRecovery);

    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("error", chunkRecovery);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-4 top-4 z-[100] rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-lg md:hidden"
    >
      <p className="text-sm font-semibold text-amber-950">
        Страница не загрузилась
      </p>
      <p className="mt-1 text-xs text-amber-900/80">
        Проверьте интернет или обновите страницу. Если установили приложение на
        экран — откройте сайт в браузере один раз.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Обновить
        </button>
        <a
          href="/offline.html"
          className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-950"
        >
          Подсказка
        </a>
      </div>
    </div>
  );
}
