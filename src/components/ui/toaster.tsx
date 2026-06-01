"use client";

/** Client Component */
/** Глобальные всплывающие уведомления Sonner */

import { Toaster } from "sonner";

/**
 * Контейнер toast-уведомлений приложения
 */
export function AppToaster() {
  return <Toaster position="top-center" richColors closeButton />;
}
