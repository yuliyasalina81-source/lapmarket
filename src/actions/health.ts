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
    return { ok: false, error: "Не удалось добавить прививку" };
  }
}

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
