import type { UserRole } from "@prisma/client";
import type { SpecialistKind } from "@/lib/supabase/database.types";
import { mapPrismaRoleToProfileRole } from "@/lib/supabase/guard";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type SyncProfileInput = {
  userId: string;
  role: UserRole;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  city?: string | null;
};

export type SyncSpecialistInput = {
  userId: string;
  kind: SpecialistKind;
  address: string;
  about?: string | null;
  licenseUrl?: string | null;
  specialties?: string[];
};

export async function upsertProfile(input: SyncProfileInput): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: input.userId,
      role: mapPrismaRoleToProfileRole(input.role),
      full_name: input.fullName,
      phone: input.phone ?? null,
      avatar_url: input.avatarUrl ?? null,
      city: input.city ?? null,
    },
    { onConflict: "user_id" }
  );

  if (error) throw new Error(error.message);
}

export async function upsertSpecialistProfile(
  input: SyncSpecialistInput
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  await upsertProfile({
    userId: input.userId,
    role: "SPECIALIST",
    fullName: "",
  });

  const supabase = createSupabaseServerClient();
  const existing = await supabase
    .from("specialist_profiles")
    .select("id")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (existing.data?.id) {
    const { error } = await supabase
      .from("specialist_profiles")
      .update({
        kind: input.kind,
        address: input.address,
        about: input.about ?? null,
        license_url: input.licenseUrl ?? undefined,
        specialties: input.specialties ?? [],
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", input.userId);
    if (error) throw new Error(error.message);
    return existing.data.id;
  }

  const { data, error } = await supabase
    .from("specialist_profiles")
    .insert({
      user_id: input.userId,
      kind: input.kind,
      address: input.address,
      about: input.about ?? null,
      license_url: input.licenseUrl ?? null,
      specialties: input.specialties ?? [],
      verification_status: "pending",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function syncUserToSupabase(user: {
  id: string;
  role: UserRole;
  displayName: string | null;
  avatar: string | null;
  city: string | null;
}): Promise<void> {
  await upsertProfile({
    userId: user.id,
    role: user.role,
    fullName: user.displayName ?? "Пользователь",
    avatarUrl: user.avatar,
    city: user.city,
  });
}
