"use client";

import { useEffect } from "react";

/** Clears broken cache-first SW (lapmarket-v1) once per browser. */
const RECOVERY_KEY = "lapmarket-sw-recovery-v2";

async function clearLegacyServiceWorker(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;

  const hadRecovery = localStorage.getItem(RECOVERY_KEY);
  if (hadRecovery) return false;

  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    if (regs.length === 0) {
      localStorage.setItem(RECOVERY_KEY, "1");
      return false;
    }

    await Promise.all(regs.map((r) => r.unregister()));
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    localStorage.setItem(RECOVERY_KEY, "1");
    return true;
  } catch {
    localStorage.setItem(RECOVERY_KEY, "1");
    return false;
  }
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = async () => {
      const reloaded = await clearLegacyServiceWorker();
      if (reloaded) {
        window.location.reload();
        return;
      }

      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          updateViaCache: "none",
        });

        await reg.update().catch(() => {});

        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          worker?.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      } catch {
        /* push is optional */
      }
    };

    if (document.readyState === "complete") {
      void register();
    } else {
      window.addEventListener("load", () => void register(), { once: true });
    }
  }, []);

  return null;
}
