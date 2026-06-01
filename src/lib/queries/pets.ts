/**
 * Запросы паспорта питомца: список, карточка, шаринг и напоминания.
 */
import { prisma } from "@/lib/prisma";
import type { ReminderStatus } from "@prisma/client";

const petInclude = {
  avatarMedia: true,
  gallery: {
    orderBy: { sortOrder: "asc" as const },
    include: { media: true },
  },
  vaccinations: { orderBy: { date: "desc" as const } },
  medicalRecords: { orderBy: { date: "desc" as const } },
  reminders: {
    where: { status: "PENDING" as ReminderStatus },
    orderBy: { dueAt: "asc" as const },
    take: 10,
  },
  weightLogs: { orderBy: { date: "desc" as const }, take: 12 },
  _count: {
    select: {
      vaccinations: true,
      medicalRecords: true,
      reminders: true,
    },
  },
};

/**
 * Питомцы пользователя с аватаром и ближайшим напоминанием.
 * @param userId Владелец
 */
export async function getUserPets(userId: string) {
  return prisma.pet.findMany({
    where: { userId },
    include: {
      avatarMedia: true,
      reminders: {
        where: { status: "PENDING" },
        orderBy: { dueAt: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Полная карточка питомца (только для владельца).
 * @param id id питомца
 * @param userId id владельца
 */
export async function getPetById(id: string, userId: string) {
  return prisma.pet.findFirst({
    where: { id, userId },
    include: petInclude,
  });
}

/**
 * Питомец по публичному токену шаринга (с проверкой expiresAt).
 * @param token Токен из ссылки
 */
export async function getPetByShareToken(token: string) {
  const share = await prisma.petShareToken.findUnique({
    where: { token },
    include: {
      pet: {
        include: {
          avatarMedia: true,
          vaccinations: { orderBy: { date: "desc" } },
          weightLogs: { orderBy: { date: "desc" }, take: 5 },
        },
      },
    },
  });
  if (!share) return null;
  if (share.expiresAt && share.expiresAt < new Date()) return null;
  return share.pet;
}

/**
 * Ближайшие напоминания по всем питомцам пользователя.
 * @param userId Владелец
 * @param limit Максимум записей
 */
export async function getUpcomingReminders(userId: string, limit = 5) {
  return prisma.reminder.findMany({
    where: {
      pet: { userId },
      status: "PENDING",
      dueAt: { gte: new Date() },
    },
    include: { pet: { select: { id: true, name: true } } },
    orderBy: { dueAt: "asc" },
    take: limit,
  });
}

export type PetDetail = NonNullable<Awaited<ReturnType<typeof getPetById>>>;
