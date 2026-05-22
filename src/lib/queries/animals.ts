import { prisma } from "@/lib/prisma";
import type { AnimalBadge, ListingStatus } from "@prisma/client";

const listingInclude = {
  images: { include: { media: true }, orderBy: { sortOrder: "asc" as const } },
  author: {
    include: { sellerProfile: true, shelterProfile: true },
  },
};

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

export async function getListingById(id: string) {
  return prisma.animalListing.findUnique({
    where: { id },
    include: listingInclude,
  });
}

export async function getAuthorListings(authorId: string) {
  return prisma.animalListing.findMany({
    where: { authorId },
    include: listingInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingListings() {
  return prisma.animalListing.findMany({
    where: { status: "PENDING" },
    include: listingInclude,
    orderBy: { createdAt: "asc" },
  });
}

export function getListingMainImage(
  listing: Awaited<ReturnType<typeof getPublishedListings>>[number]
): string | null {
  return listing.images[0]?.media.url ?? null;
}

export type ListingWithRelations = Awaited<
  ReturnType<typeof getPublishedListings>
>[number];
