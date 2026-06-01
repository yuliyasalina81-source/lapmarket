/** Server Actions для питомцев */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import type { AnimalKind, PetSex } from "@prisma/client";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

type PetFormData = {
  name: string;
  kind: AnimalKind;
  breed?: string;
  sex?: PetSex;
  birthDate?: Date;
  weightKg?: number;
  microchip?: string;
  notes?: string;
};

function parsePetForm(
  formData: FormData
): { ok: true; data: PetFormData } | { ok: false; error: string } {
  const name = (formData.get("name") as string)?.trim();
  const kind = (formData.get("kind") as AnimalKind) || "OTHER";
  const breed = (formData.get("breed") as string)?.trim() || undefined;
  const sex = (formData.get("sex") as PetSex) || undefined;
  const birthDateRaw = formData.get("birthDate") as string;
  const birthDate = birthDateRaw ? new Date(birthDateRaw) : undefined;
  const weightRaw = formData.get("weightKg") as string;
  const weightKg = weightRaw ? parseFloat(weightRaw) : undefined;
  const microchip = (formData.get("microchip") as string)?.trim() || undefined;
  const notes = (formData.get("notes") as string)?.trim() || undefined;

  if (!name) return { ok: false, error: "Укажите имя питомца" };
  return {
    ok: true,
    data: { name, kind, breed, sex, birthDate, weightKg, microchip, notes },
  };
}

/**
 * Создаёт питомца владельца с опциональным аватаром.
 * @param formData — поля карточки и avatarMediaId
 * @returns ActionResult с id питомца
 */
export async function createPet(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const parsed = parsePetForm(formData);
    if (!parsed.ok) return { ok: false, error: parsed.error };

    const avatarMediaIdRaw = (formData.get("avatarMediaId") as string)?.trim();
    let avatarMediaId: string | undefined;
    if (avatarMediaIdRaw) {
      const media = await prisma.mediaAsset.findFirst({
        where: { id: avatarMediaIdRaw, userId: user.id },
      });
      if (!media) return { ok: false, error: "Фото не найдено" };
      avatarMediaId = media.id;
    }

    const pet = await prisma.pet.create({
      data: { userId: user.id, ...parsed.data, avatarMediaId },
    });

    revalidatePath("/pets");
    revalidatePath("/profile");
    return { ok: true, id: pet.id };
  } catch {
    return { ok: false, error: "Не удалось создать питомца" };
  }
}

/**
 * Обновляет данные питомца владельца.
 * @param id — идентификатор питомца
 * @param formData — поля карточки и avatarMediaId
 * @returns ActionResult
 */
export async function updatePet(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const existing = await prisma.pet.findFirst({ where: { id, userId: user.id } });
    if (!existing) return { ok: false, error: "Питомец не найден" };

    const parsed = parsePetForm(formData);
    if (!parsed.ok) return { ok: false, error: parsed.error };

    let avatarMediaId = existing.avatarMediaId;
    const avatarMediaIdRaw = (formData.get("avatarMediaId") as string)?.trim();
    if (avatarMediaIdRaw) {
      const media = await prisma.mediaAsset.findFirst({
        where: { id: avatarMediaIdRaw, userId: user.id },
      });
      if (!media) return { ok: false, error: "Фото не найдено" };
      avatarMediaId = media.id;
    }

    await prisma.pet.update({
      where: { id },
      data: { ...parsed.data, avatarMediaId },
    });

    revalidatePath(`/pets/${id}`);
    revalidatePath("/pets");
    revalidatePath("/profile");
    return { ok: true, id };
  } catch {
    return { ok: false, error: "Не удалось сохранить" };
  }
}

/**
 * Удаляет питомца владельца.
 * @param id — идентификатор питомца
 * @returns ActionResult
 */
export async function deletePet(id: string): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    await prisma.pet.deleteMany({ where: { id, userId: user.id } });
    revalidatePath("/pets");
    revalidatePath("/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось удалить" };
  }
}

/**
 * Создаёт токен публичного доступа к карточке питомца (30 дней).
 * @param petId — идентификатор питомца
 * @returns ActionResult с token
 */
export async function createPetShareToken(petId: string): Promise<
  ActionResult & { token?: string }
> {
  try {
    const user = await requireSessionUser();
    const pet = await prisma.pet.findFirst({ where: { id: petId, userId: user.id } });
    if (!pet) return { ok: false, error: "Питомец не найден" };

    const share = await prisma.petShareToken.create({
      data: {
        petId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    return { ok: true, token: share.token };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}
