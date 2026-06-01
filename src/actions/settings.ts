/** Server Actions для настроек профиля */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { uploadImage } from "@/actions/media";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Обновляет displayName и город в профиле.
 * @param formData — displayName, city
 * @returns ActionResult
 */
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const displayName = (formData.get("displayName") as string)?.trim();
    const city = (formData.get("city") as string)?.trim() || null;

    if (!displayName) {
      return { ok: false, error: "Укажите имя" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { displayName, city, name: displayName },
    });

    revalidatePath("/profile");
    revalidatePath("/settings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось сохранить" };
  }
}

/**
 * Загружает аватар и сохраняет URL в профиле.
 * @param formData — поле file
 * @returns ActionResult
 */
export async function updateAvatar(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Выберите фото" };
    }

    const uploadForm = new FormData();
    uploadForm.set("file", file);
    const result = await uploadImage(uploadForm, "avatars");
    // Ошибка uploadImage пробрасывается клиенту
    if (!result.ok) return { ok: false, error: result.error };

    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: result.url, image: result.url },
    });

    revalidatePath("/profile");
    revalidatePath("/settings");
    revalidatePath("/feed");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось обновить аватар" };
  }
}
