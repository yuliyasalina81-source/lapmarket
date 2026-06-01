/**
 * Запросы услуг и бронирований через Prisma (ServiceProvider, ServiceBooking).
 */
import { prisma } from "@/lib/prisma";
import type { ServiceKind } from "@prisma/client";

const providerInclude = {
  media: true,
  user: { select: { displayName: true } },
};

/**
 * Верифицированные провайдеры с опциональным фильтром.
 * @param kind Тип услуги
 * @param city Подстрока города
 */
export async function getServiceProviders(kind?: ServiceKind, city?: string) {
  return prisma.serviceProvider.findMany({
    where: {
      verified: true,
      ...(kind ? { kind } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" as const } } : {}),
    },
    include: providerInclude,
    orderBy: { rating: "desc" },
  });
}

/**
 * Один провайдер по id.
 * @param id id ServiceProvider
 */
export async function getServiceProviderById(id: string) {
  return prisma.serviceProvider.findUnique({
    where: { id },
    include: providerInclude,
  });
}

/**
 * Бронирования клиента.
 * @param userId id пользователя
 */
export async function getUserBookings(userId: string) {
  return prisma.serviceBooking.findMany({
    where: { userId },
    include: {
      provider: { include: { media: true } },
      pet: { select: { id: true, name: true } },
      review: true,
    },
    orderBy: { scheduledAt: "desc" },
  });
}

/**
 * Бронирования у провайдера, привязанного к userId.
 * @param userId id владельца провайдера
 */
export async function getProviderBookings(userId: string) {
  return prisma.serviceBooking.findMany({
    where: { provider: { userId } },
    include: {
      user: { select: { displayName: true, email: true } },
      pet: { select: { name: true } },
      provider: { select: { name: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });
}

export type ServiceProviderWithMedia = Awaited<
  ReturnType<typeof getServiceProviders>
>[number];
