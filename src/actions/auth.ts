"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validations/auth";
import type { UserRole } from "@prisma/client";

export type RegisterState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

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

  try {
    await prisma.user.create({
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
  } catch {
    return { error: "Не удалось создать аккаунт. Попробуйте позже." };
  }

  redirect("/login?registered=1");
}
