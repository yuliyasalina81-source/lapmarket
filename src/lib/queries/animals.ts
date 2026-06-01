/**
 * Запросы объявлений о животных: каталог, карточка, модерация и превью.
 */
import { prisma } from "@/lib/prisma";
import type { AnimalBadge, ListingStatus } from "@prisma/client";

const listingInclude = {
  images: { include: { media: true }, orderBy: { sortOrder: "asc" as const } },
  author: {
    include: { sellerProfile: true, shelterProfile: true },
  },
};

/**
 * Опубликованные объявления с опциональным бейджем.
 * @param badge Фильтр по AnimalBadge
 */
export async function getPublishedListings(badge?: AnimalBadge) {
  return prisma.animalListing.findMany({
    where: {
      status: "PUBLISHED",
      ...(badge ? { badges: { has: badge } } : {}),
    },
    include: listingInclude,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Объявление по id с автором и изображениями.
 * @param id id listing
 */
export async function getListingById(id: string) {
  return prisma.animalListing.findUnique({
    where: { id },
    include: listingInclude,
  });
}

/**
 * Все объявления автора.
 * @param authorId id пользователя
 */
export async function getAuthorListings(authorId: string) {
  return prisma.animalListing.findMany({
    where: { authorId },
    include: listingInclude,
    orderBy: { createdAt: "desc" },
  });
}

/** Объявления на модерации (PENDING). */
export async function getPendingListings() {
  return prisma.animalListing.findMany({
    where: { status: "PENDING" },
    include: listingInclude,
    orderBy: { createdAt: "asc" },
  });
}

/**
 * URL первого фото объявления.
 * @param listing Объявление с images
 * @returns url или null
 */
export function getListingMainImage(
  listing: Awaited<ReturnType<typeof getPublishedListings>>[number]
): string | null {
  return listing.images[0]?.media.url ?? null;
}

export type ListingWithRelations = Awaited<
  ReturnType<typeof getPublishedListings>
>[number];
