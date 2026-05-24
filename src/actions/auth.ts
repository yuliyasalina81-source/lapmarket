"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validations/auth";
import { registerSpecialistProfile } from "@/actions/services-supabase";
import { upsertProfile } from "@/lib/supabase/sync";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { UserRole } from "@prisma/client";
import type { SpecialistKind } from "@/lib/supabase/database.types";

export type RegisterState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function formatRegisterError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes("profiles") || msg.includes("specialist_profiles")) {
      return "База Supabase не настроена: выполните SQL из supabase/migrations/001_services_marketplace.sql в Supabase SQL Editor.";
    }
    if (msg.includes("Bucket not found") || msg.includes("licenses")) {
      return "Создайте bucket «licenses» в Supabase Storage (private), затем повторите регистрацию или загрузите лицензию в кабинете специалиста.";
    }
    if (msg.includes("Invalid enum value") || msg.includes("UserRole")) {
      return "Обновите базу данных: выполните npx prisma db push";
    }
    return msg;
  }
  return "Не удалось создать аккаунт. Попробуйте позже.";
}

async function uploadSpecialistLicense(
  userId: string,
  licenseFile: File
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const supabase = createSupabaseServerClient();
  const ext = licenseFile.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const path = `${userId}/license-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await licenseFile.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("licenses")
    .upload(path, buffer, {
      contentType: licenseFile.type || "application/octet-stream",
      upsert: true,
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage.from("licenses").getPublicUrl(path);
  return { ok: true, url: urlData.publicUrl };
}

export async function registerUser(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
    city: formData.get("city") || undefined,
    avatar: formData.get("avatar") || "🐾",
    role: formData.get("role"),
    pets: formData.get("pets") || undefined,
    shopName: formData.get("shopName") || undefined,
    shopDescription: formData.get("shopDescription") || undefined,
    organizationName: formData.get("organizationName") || undefined,
    shelterDescription: formData.get("shelterDescription") || undefined,
    shelterCity: formData.get("shelterCity") || undefined,
    specialistKind: formData.get("specialistKind") || undefined,
    specialistAddress: formData.get("specialistAddress") || undefined,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const data = parsed.data;
  const email = data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Пользователь с таким email уже зарегистрирован" };
  }

  const passwordHash = await hashPassword(data.password);
  const role = data.role as UserRole;
  const avatar = data.avatar || "🐾";
  const city =
    role === "SHELTER"
      ? data.shelterCity?.trim()
      : data.city?.trim() || undefined;

  const petNames =
    role === "OWNER" && data.pets
      ? data.pets
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      : [];

  const licenseFile =
    role === "SPECIALIST" ? formData.get("license") : null;
  if (role === "SPECIALIST") {
    if (!(licenseFile instanceof File) || licenseFile.size === 0) {
      return { error: "Загрузите файл лицензии" };
    }
  }

  let userId: string | null = null;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: data.displayName,
        displayName: data.displayName,
        avatar,
        city,
        role,
        passwordHash,
        pets:
          petNames.length > 0
            ? { create: petNames.map((name) => ({ name, kind: "OTHER" as const })) }
            : undefined,
        sellerProfile:
          role === "SELLER"
            ? {
                create: {
                  shopName: data.shopName!.trim(),
                  description: data.shopDescription!.trim(),
                  tier: "PENDING",
                },
              }
            : undefined,
        shelterProfile:
          role === "SHELTER"
            ? {
                create: {
                  organizationName: data.organizationName!.trim(),
                  description: data.shelterDescription!.trim(),
                  city: data.shelterCity!.trim(),
                },
              }
            : undefined,
      },
    });
    userId = user.id;

    if (role === "SPECIALIST") {
      if (!isSupabaseConfigured()) {
        redirect("/login?registered=specialist&supabase=pending");
      }

      await upsertProfile({
        userId: user.id,
        role,
        fullName: data.displayName,
        avatarUrl: avatar,
        city: city ?? null,
      });

      let licenseUrl: string | null = null;
      if (licenseFile instanceof File && licenseFile.size > 0) {
        const uploaded = await uploadSpecialistLicense(user.id, licenseFile);
        if (uploaded.ok) {
          licenseUrl = uploaded.url;
        }
        // Если bucket ещё не создан — профиль создаём без URL, лицензию загрузят в кабинете
      }

      const reg = await registerSpecialistProfile({
        userId: user.id,
        fullName: data.displayName,
        city: city!,
        kind: data.specialistKind as SpecialistKind,
        address: data.specialistAddress!.trim(),
        licenseUrl: licenseUrl ?? "",
        specialties: [],
      });

      if (!reg.ok) {
        await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
        return { error: reg.error };
      }

      redirect("/login?registered=specialist");
    }

    if (isSupabaseConfigured()) {
      await upsertProfile({
        userId: user.id,
        role,
        fullName: data.displayName,
        avatarUrl: avatar,
        city: city ?? null,
      });
    }
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e;
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    console.error("[registerUser]", e);
    return { error: formatRegisterError(e) };
  }

  redirect("/login?registered=1");
}
