/**
 * Связь специалистов Supabase/Prisma: маппинг kind и ServiceProvider в Prisma.
 */
import { prisma } from "@/lib/prisma";
import type { ServiceKind } from "@prisma/client";
import type { SpecialistKind } from "@/lib/supabase/database.types";

/**
 * Преобразует kind специалиста Supabase в ServiceKind Prisma.
 * @param kind vet | groomer
 * @returns GROOMING или VETERINARY
 */
export function specialistKindToPrisma(kind: SpecialistKind): ServiceKind {
  return kind === "groomer" ? "GROOMING" : "VETERINARY";
}

/**
 * Создаёт ServiceProvider по умолчанию, если у пользователя ещё нет записи.
 * @param userId Идентификатор пользователя
 * @returns Существующий или новый provider, null если user не найден
 */
export async function ensureServiceProviderForUser(userId: string) {
  const existing = await prisma.serviceProvider.findFirst({
    where: { userId },
  });
  if (existing) return existing;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true, city: true },
  });
  if (!user) return null;

  return prisma.serviceProvider.create({
    data: {
      userId,
      name: user.displayName ?? "Специалист",
      kind: "VETERINARY",
      city: user.city ?? "Не указан",
      address: "Укажите адрес в кабинете",
      priceFrom: 1000,
      specialties: ["Приём"],
      verified: false,
    },
  });
}

/**
 * Возвращает провайдера услуг пользователя с медиа.
 * @param userId Идентификатор пользователя
 * @returns ServiceProvider с include media или null
 */
export async function getServiceProviderForUser(userId: string) {
  return prisma.serviceProvider.findFirst({
    where: { userId },
    include: { media: true },
  });
}
