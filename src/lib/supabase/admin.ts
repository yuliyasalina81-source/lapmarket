/**
 * Алиас серверного клиента Supabase для модерации и админ-действий.
 */
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Создаёт клиент Supabase с правами администратора (service role).
 * @returns Тот же клиент, что и createSupabaseServerClient
 */
export function createSupabaseAdminClient() {
  return createSupabaseServerClient();
}
