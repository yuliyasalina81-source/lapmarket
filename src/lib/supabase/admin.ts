import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Alias for moderation / admin server actions. */
export function createSupabaseAdminClient() {
  return createSupabaseServerClient();
}
