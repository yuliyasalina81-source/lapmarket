/** Server Actions для профиля специалиста (Prisma) */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/supabase/guard";
import type { ServiceKind } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Обновляет карточку ServiceProvider в Prisma (fallback без Supabase).
 * @param formData — providerId, name, kind, city, address, priceFrom
 * @returns ActionResult
 */
export async function updatePrismaProviderProfile(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuthUser();
    const providerId = formData.get("providerId") as string;
    const name = (formData.get("name") as string)?.trim();
    const kind = formData.get("kind") as ServiceKind;
    const city = (formData.get("city") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const priceFrom = Number(formData.get("priceFrom"));

    if (!name || !city || !address) {
      return { ok: false, error: "Заполните все поля" };
    }

    const provider = await prisma.serviceProvider.findFirst({
      where: { id: providerId, userId: user.id },
    });
    if (!provider) return { ok: false, error: "Профиль не найден" };

    await prisma.serviceProvider.update({
      where: { id: providerId },
      data: {
        name,
        kind: kind === "GROOMING" ? "GROOMING" : "VETERINARY",
        city,
        address,
        priceFrom: Number.isFinite(priceFrom) ? priceFrom : provider.priceFrom,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { city, displayName: name },
    });

    revalidatePath("/dashboard/specialist");
    revalidatePath("/services");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Ошибка сохранения",
    };
  }
}
