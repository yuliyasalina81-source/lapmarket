/**
 * Серверный клиент Supabase с service role.
 * Вызывать только после проверки NextAuth в server actions / API.
 */
import { createClient } from "@supabase/supabase-js";

/**
 * Создаёт серверный клиент с service role (без persist сессии).
 * @returns Клиент Supabase для серверного кода
 * @throws Error если URL или service role key не заданы
 */
export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY не заданы"
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Проверяет, заданы ли переменные для подключения к Supabase.
 * @returns true, если URL и service role key присутствуют
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
