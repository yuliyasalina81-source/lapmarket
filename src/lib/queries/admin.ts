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
