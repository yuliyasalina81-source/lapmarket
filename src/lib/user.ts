/**
 * Запросы профиля пользователя: данные, статистика и статус сертифицированного продавца.
 */
import { prisma } from "@/lib/prisma";
import { getUserPostCount } from "@/lib/queries/posts";

/**
 * Загружает пользователя с питомцами и профилями продавца/приюта и считает статистику.
 * @param userId Идентификатор пользователя
 * @returns user + stats или null, если не найден
 */
export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      pets: true,
      sellerProfile: true,
      shelterProfile: true,
    },
  });
  if (!user) return null;

  const [postCount, listingCount, bookingCount] = await Promise.all([
    getUserPostCount(userId),
    prisma.animalListing.count({ where: { authorId: userId } }),
    prisma.serviceBooking.count({ where: { userId } }),
  ]);

  return { user, stats: { postCount, listingCount, bookingCount } };
}

/**
 * Возвращает профиль продавца по userId.
 * @param userId Идентификатор пользователя
 * @returns SellerProfile или null
 */
export async function getSellerProfile(userId: string) {
  return prisma.sellerProfile.findUnique({ where: { userId } });
}

/**
 * Проверяет, имеет ли продавец статус CERTIFIED.
 * @param userId Идентификатор пользователя
 * @returns true для tier CERTIFIED
 */
export async function isCertifiedSeller(userId: string) {
  const profile = await getSellerProfile(userId);
  return profile?.tier === "CERTIFIED";
}
