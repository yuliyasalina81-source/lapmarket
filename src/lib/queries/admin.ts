import { prisma } from "@/lib/prisma";

export async function getPendingCertifications() {
  return prisma.sellerCertificationRequest.findMany({
    where: { status: "PENDING" },
    include: {
      sellerProfile: {
        include: { user: { select: { id: true, displayName: true, email: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPendingListingsForAdmin() {
  return prisma.animalListing.findMany({
    where: { status: "PENDING" },
    include: {
      images: { include: { media: true }, orderBy: { sortOrder: "asc" } },
      author: { select: { displayName: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAdminUsers(limit = 50) {
  return prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAdminProducts(limit = 50) {
  return prisma.product.findMany({
    include: {
      seller: { select: { displayName: true } },
      images: { include: { media: true }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export async function getAdminPosts(limit = 30) {
  return prisma.post.findMany({
    include: {
      author: { select: { displayName: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAdminProductReviews(limit = 30) {
  return prisma.productReview.findMany({
    include: {
      product: { select: { title: true } },
      user: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAdminServiceReviews(limit = 30) {
  return prisma.serviceReview.findMany({
    include: {
      provider: { select: { name: true } },
      user: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAdminServiceProviders(limit = 50) {
  return prisma.serviceProvider.findMany({
    include: { user: { select: { displayName: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
