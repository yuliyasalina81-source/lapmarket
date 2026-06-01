/**
 * Клиент Supabase для браузера (anon key).
 * Используется в клиентских компонентах и хуках.
 */
import { createBrowserClient } from "@supabase/ssr";

/**
 * Создаёт браузерный клиент Supabase с публичными переменными окружения.
 * @returns Экземпляр Supabase client для браузера
 * @throws Error если URL или anon key не заданы
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY не заданы"
    );
  }
  return createBrowserClient(url, key);
}
