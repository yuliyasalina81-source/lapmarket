import { prisma } from "@/lib/prisma";

export async function globalSearch(q: string) {
  const query = q.trim();
  if (!query || query.length < 2) {
    return { posts: [], products: [], listings: [], providers: [] };
  }

  const contains = { contains: query, mode: "insensitive" as const };

  const [posts, products, listings, providers] = await Promise.all([
    prisma.post.findMany({
      where: { content: contains },
      take: 5,
      select: { id: true, content: true, petName: true },
    }),
    prisma.product.findMany({
      where: { title: contains, status: "PUBLISHED" },
      take: 5,
      select: { id: true, title: true, price: true },
    }),
    prisma.animalListing.findMany({
      where: { name: contains, status: "PUBLISHED" },
      take: 5,
      select: { id: true, name: true, city: true },
    }),
    prisma.serviceProvider.findMany({
      where: { name: contains, verified: true },
      take: 5,
      select: { id: true, name: true, city: true, kind: true },
    }),
  ]);

  return { posts, products, listings, providers };
}
