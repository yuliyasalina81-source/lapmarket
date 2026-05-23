import { prisma } from "@/lib/prisma";
import type { ProductCategory } from "@prisma/client";

const productInclude = {
  images: { include: { media: true }, orderBy: { sortOrder: "asc" as const } },
  seller: {
    include: { sellerProfile: true },
  },
};

export type ProductFilters = {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "rating";
};

export async function getPublishedProducts(filters: ProductFilters = {}) {
  const { category, minPrice, maxPrice, sellerId, q, sort = "newest" } = filters;

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
        ? { price: "desc" as const }
        : sort === "rating"
          ? { rating: "desc" as const }
          : { createdAt: "desc" as const };

  return prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      seller: { sellerProfile: { tier: "CERTIFIED" } },
      ...(category ? { category } : {}),
      ...(sellerId ? { sellerId } : {}),
      ...(minPrice != null || maxPrice != null
        ? {
            price: {
              ...(minPrice != null ? { gte: minPrice } : {}),
              ...(maxPrice != null ? { lte: maxPrice } : {}),
            },
          }
        : {}),
      ...(q && q.length >= 2
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: productInclude,
    orderBy,
  });
}

export async function getMarketSellers() {
  return prisma.user.findMany({
    where: {
      role: "SELLER",
      sellerProfile: { tier: "CERTIFIED" },
      products: { some: { status: "PUBLISHED" } },
    },
    select: { id: true, displayName: true },
    orderBy: { displayName: "asc" },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
}

export async function getSellerProducts(sellerId: string) {
  return prisma.product.findMany({
    where: { sellerId },
    include: productInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProductReviews(productId: string) {
  return prisma.productReview.findMany({
    where: { productId },
    include: {
      user: { select: { id: true, displayName: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getProductMainImage(
  product: Awaited<ReturnType<typeof getPublishedProducts>>[number]
): string | null {
  return product.images[0]?.media.url ?? null;
}
