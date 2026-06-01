/** Server Actions для напоминаний по питомцам */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { createNotification } from "@/lib/notifications";
import type { ReminderType } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Создаёт напоминание для питомца.
 * @param petId — идентификатор питомца
 * @param formData — type, title, dueAt, repeatDays
 * @returns ActionResult
 */
export async function createReminder(
  petId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const pet = await prisma.pet.findFirst({ where: { id: petId, userId: user.id } });
    if (!pet) return { ok: false, error: "Питомец не найден" };

    const type = formData.get("type") as ReminderType;
    const title = (formData.get("title") as string)?.trim();
    const dueAtRaw = formData.get("dueAt") as string;
    const repeatRaw = formData.get("repeatDays") as string;
    const repeatDays = repeatRaw ? parseInt(repeatRaw, 10) : undefined;

    if (!title || !dueAtRaw) return { ok: false, error: "Заполните название и дату" };

    await prisma.reminder.create({
      data: {
        petId,
        type: type || "CUSTOM",
        title,
        dueAt: new Date(dueAtRaw),
        repeatDays: repeatDays && !isNaN(repeatDays) ? repeatDays : undefined,
      },
    });

    revalidatePath(`/pets/${petId}`);
    revalidatePath("/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось создать напоминание" };
  }
}

/**
 * Отмечает напоминание выполненным или пропущенным; при repeatDays создаёт следующее.
 * @param id — идентификатор напоминания
 * @param status — DONE или SKIPPED
 * @returns ActionResult
 */
export async function updateReminderStatus(
  id: string,
  status: "DONE" | "SKIPPED"
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const reminder = await prisma.reminder.findFirst({
      where: { id, pet: { userId: user.id } },
      include: { pet: true },
    });
    if (!reminder) return { ok: false, error: "Не найдено" };

    await prisma.reminder.update({ where: { id }, data: { status } });

    if (status === "DONE" && reminder.repeatDays) {
      const nextDue = new Date(reminder.dueAt);
      nextDue.setDate(nextDue.getDate() + reminder.repeatDays);
      await prisma.reminder.create({
        data: {
          petId: reminder.petId,
          type: reminder.type,
          title: reminder.title,
          dueAt: nextDue,
          repeatDays: reminder.repeatDays,
        },
      });
    }

    revalidatePath(`/pets/${reminder.petId}`);
    revalidatePath("/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}

/**
 * Обновляет название и дату напоминания.
 * @param id — идентификатор напоминания
 * @param formData — title, dueAt
 * @returns ActionResult
 */
export async function updateReminder(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const reminder = await prisma.reminder.findFirst({
      where: { id, pet: { userId: user.id } },
    });
    if (!reminder) return { ok: false, error: "Не найдено" };

    const title = (formData.get("title") as string)?.trim();
    const dueAtRaw = formData.get("dueAt") as string;

    await prisma.reminder.update({
      where: { id },
      data: {
        title: title || reminder.title,
        dueAt: dueAtRaw ? new Date(dueAtRaw) : reminder.dueAt,
      },
    });

    revalidatePath(`/pets/${reminder.petId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка обновления" };
  }
}

/**
 * Удаляет напоминание владельца питомца.
 * @param id — идентификатор напоминания
 * @returns ActionResult
 */
export async function deleteReminder(id: string): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const reminder = await prisma.reminder.findFirst({
      where: { id, pet: { userId: user.id } },
    });
    if (!reminder) return { ok: false, error: "Не найдено" };
    await prisma.reminder.delete({ where: { id } });
    revalidatePath(`/pets/${reminder.petId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка удаления" };
  }
}

/**
 * Cron/фон: шлёт уведомления по напоминаниям в ближайшие 3 дня (без дублей за сутки).
 * @returns число обработанных напоминаний { processed }
 */
export async function processDueReminders(): Promise<{ processed: number }> {
  const now = new Date();
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const reminders = await prisma.reminder.findMany({
    where: {
      status: "PENDING",
      dueAt: { lte: inThreeDays, gte: now },
    },
    include: { pet: { include: { user: true } } },
  });

  let processed = 0;
  for (const r of reminders) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: r.pet.userId,
        link: `/pets/${r.petId}`,
        title: r.title,
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    });
    if (existing) continue;

    await createNotification({
      userId: r.pet.userId,
      type: "REMINDER",
      title: `Напоминание: ${r.title}`,
      body: `${r.pet.name} — ${r.dueAt.toLocaleDateString("ru-RU")}`,
      link: `/pets/${r.petId}`,
    });
    processed++;
  }
  return { processed };
}
