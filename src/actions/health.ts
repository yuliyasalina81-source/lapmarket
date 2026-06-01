/** Server Actions для здоровья питомцев */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function assertPetOwner(petId: string, userId: string) {
  const pet = await prisma.pet.findFirst({ where: { id: petId, userId } });
  if (!pet) throw new Error("NOT_FOUND");
  return pet;
}

/**
 * Добавляет запись о прививке питомцу.
 * @param petId — идентификатор питомца
 * @param formData — name, date, nextDueAt, clinic, notes
 * @returns ActionResult
 */
export async function addVaccination(
  petId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    await assertPetOwner(petId, user.id);

    const name = (formData.get("name") as string)?.trim();
    const dateRaw = formData.get("date") as string;
    const nextDueRaw = formData.get("nextDueAt") as string;
    const clinic = (formData.get("clinic") as string)?.trim() || undefined;
    const notes = (formData.get("notes") as string)?.trim() || undefined;

    if (!name || !dateRaw) return { ok: false, error: "Заполните название и дату" };

    await prisma.vaccination.create({
      data: {
        petId,
        name,
        date: new Date(dateRaw),
        nextDueAt: nextDueRaw ? new Date(nextDueRaw) : undefined,
        clinic,
        notes,
      },
    });

    revalidatePath(`/pets/${petId}`);
    return { ok: true };
  } catch {
    // assertPetOwner бросает NOT_FOUND или ошибка БД
    return { ok: false, error: "Не удалось добавить прививку" };
  }
}

/**
 * Добавляет медицинскую запись в паспорт питомца.
 * @param petId — идентификатор питомца
 * @param formData — title, date, diagnosis, treatment, providerName
 * @returns ActionResult
 */
export async function addMedicalRecord(
  petId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    await assertPetOwner(petId, user.id);

    const title = (formData.get("title") as string)?.trim();
    const dateRaw = formData.get("date") as string;
    const diagnosis = (formData.get("diagnosis") as string)?.trim() || undefined;
    const treatment = (formData.get("treatment") as string)?.trim() || undefined;
    const providerName =
      (formData.get("providerName") as string)?.trim() || undefined;

    if (!title || !dateRaw) return { ok: false, error: "Заполните заголовок и дату" };

    await prisma.medicalRecord.create({
      data: {
        petId,
        title,
        date: new Date(dateRaw),
        diagnosis,
        treatment,
        providerName,
      },
    });

    revalidatePath(`/pets/${petId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось добавить запись" };
  }
}

/**
 * Добавляет запись веса и обновляет weightKg на карточке питомца.
 * @param petId — идентификатор питомца
 * @param kg — вес в килограммах
 * @returns ActionResult
 */
export async function addWeightLog(
  petId: string,
  kg: number
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    await assertPetOwner(petId, user.id);
    if (isNaN(kg) || kg <= 0) return { ok: false, error: "Укажите вес" };

    await prisma.weightLog.create({ data: { petId, kg } });
    await prisma.pet.update({ where: { id: petId }, data: { weightKg: kg } });

    revalidatePath(`/pets/${petId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}

/**
 * Обновляет прививку владельца питомца.
 * @param id — идентификатор Vaccination
 * @param formData — поля прививки
 * @returns ActionResult
 */
export async function updateVaccination(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const row = await prisma.vaccination.findFirst({
      where: { id, pet: { userId: user.id } },
    });
    if (!row) return { ok: false, error: "Не найдено" };

    const name = (formData.get("name") as string)?.trim();
    const dateRaw = formData.get("date") as string;
    const nextDueRaw = formData.get("nextDueAt") as string;
    const clinic = (formData.get("clinic") as string)?.trim() || undefined;

    await prisma.vaccination.update({
      where: { id },
      data: {
        name: name || row.name,
        date: dateRaw ? new Date(dateRaw) : row.date,
        nextDueAt: nextDueRaw ? new Date(nextDueRaw) : null,
        clinic,
      },
    });
    revalidatePath(`/pets/${row.petId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка обновления" };
  }
}

/**
 * Удаляет прививку.
 * @param id — идентификатор Vaccination
 * @returns ActionResult
 */
export async function deleteVaccination(id: string): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const row = await prisma.vaccination.findFirst({
      where: { id, pet: { userId: user.id } },
    });
    if (!row) return { ok: false, error: "Не найдено" };
    await prisma.vaccination.delete({ where: { id } });
    revalidatePath(`/pets/${row.petId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка удаления" };
  }
}

/**
 * Обновляет медицинскую запись.
 * @param id — идентификатор MedicalRecord
 * @param formData — поля записи
 * @returns ActionResult
 */
export async function updateMedicalRecord(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const row = await prisma.medicalRecord.findFirst({
      where: { id, pet: { userId: user.id } },
    });
    if (!row) return { ok: false, error: "Не найдено" };

    const title = (formData.get("title") as string)?.trim();
    const dateRaw = formData.get("date") as string;
    const diagnosis = (formData.get("diagnosis") as string)?.trim() || undefined;
    const treatment = (formData.get("treatment") as string)?.trim() || undefined;
    const providerName =
      (formData.get("providerName") as string)?.trim() || undefined;

    await prisma.medicalRecord.update({
      where: { id },
      data: {
        title: title || row.title,
        date: dateRaw ? new Date(dateRaw) : row.date,
        diagnosis,
        treatment,
        providerName,
      },
    });
    revalidatePath(`/pets/${row.petId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка обновления" };
  }
}

/**
 * Удаляет медицинскую запись.
 * @param id — идентификатор MedicalRecord
 * @returns ActionResult
 */
export async function deleteMedicalRecord(id: string): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const row = await prisma.medicalRecord.findFirst({
      where: { id, pet: { userId: user.id } },
    });
    if (!row) return { ok: false, error: "Не найдено" };
    await prisma.medicalRecord.delete({ where: { id } });
    revalidatePath(`/pets/${row.petId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка удаления" };
  }
}

/**
 * Удаляет запись из журнала веса.
 * @param id — идентификатор WeightLog
 * @returns ActionResult
 */
export async function deleteWeightLog(id: string): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const row = await prisma.weightLog.findFirst({
      where: { id, pet: { userId: user.id } },
    });
    if (!row) return { ok: false, error: "Не найдено" };
    await prisma.weightLog.delete({ where: { id } });
    revalidatePath(`/pets/${row.petId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка удаления" };
  }
}
