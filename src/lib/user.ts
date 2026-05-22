import { prisma } from "@/lib/prisma";
import { getUserPostCount } from "@/lib/queries/posts";

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

export async function getSellerProfile(userId: string) {
  return prisma.sellerProfile.findUnique({ where: { userId } });
}

export async function isCertifiedSeller(userId: string) {
  const profile = await getSellerProfile(userId);
  return profile?.tier === "CERTIFIED";
}
