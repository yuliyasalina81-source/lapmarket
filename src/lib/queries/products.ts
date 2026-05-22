import { prisma } from "@/lib/prisma";
import type { ProductCategory } from "@prisma/client";

const productInclude = {
  images: { include: { media: true }, orderBy: { sortOrder: "asc" as const } },
  seller: {
    include: { sellerProfile: true },
  },
};

export async function getPublishedProducts(category?: ProductCategory) {
  return prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      seller: { sellerProfile: { tier: "CERTIFIED" } },
      ...(category ? { category } : {}),
    },
    include: productInclude,
    orderBy: { createdAt: "desc" },
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

export function getProductMainImage(
  product: Awaited<ReturnType<typeof getPublishedProducts>>[number]
): string | null {
  return product.images[0]?.media.url ?? null;
}
