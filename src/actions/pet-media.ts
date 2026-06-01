/** Server Actions для медиа галереи питомцев */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Добавляет фото в галерею питомца по mediaId из формы.
 * @param petId — идентификатор питомца
 * @param formData — поле mediaId (уже загруженный MediaAsset)
 * @returns ActionResult
 */
export async function addPetGalleryPhoto(
  petId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const pet = await prisma.pet.findFirst({
      where: { id: petId, userId: user.id },
    });
    if (!pet) return { ok: false, error: "Питомец не найден" };

    const mediaId = (formData.get("mediaId") as string)?.trim();
    if (!mediaId) return { ok: false, error: "Сначала загрузите фото" };

    const media = await prisma.mediaAsset.findFirst({
      where: { id: mediaId, userId: user.id },
    });
    // Медиа должно принадлежать текущему пользователю
    if (!media) return { ok: false, error: "Фото не найдено" };

    const count = await prisma.petMedia.count({ where: { petId } });
    await prisma.petMedia.create({
      data: {
        petId,
        mediaId: media.id,
        sortOrder: count,
      },
    });

    revalidatePath(`/pets/${petId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось загрузить фото" };
  }
}

/**
 * Удаляет запись галереи питомца.
 * @param petId — идентификатор питомца
 * @param petMediaId — идентификатор PetMedia
 * @returns ActionResult
 */
export async function removePetGalleryPhoto(
  petId: string,
  petMediaId: string
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const row = await prisma.petMedia.findFirst({
      where: { id: petMediaId, pet: { id: petId, userId: user.id } },
    });
    if (!row) return { ok: false, error: "Фото не найдено" };

    await prisma.petMedia.delete({ where: { id: petMediaId } });
    revalidatePath(`/pets/${petId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка удаления" };
  }
}
