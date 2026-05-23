import { prisma } from "@/lib/prisma";

const postInclude = {
  author: { select: { id: true, displayName: true, avatar: true } },
  pet: { select: { id: true, name: true } },
  media: true,
  images: { include: { media: true }, orderBy: { sortOrder: "asc" as const } },
  likes: { select: { userId: true } },
  comments: {
    include: {
      author: { select: { id: true, displayName: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
  _count: { select: { likes: true, comments: true } },
};

export async function getFeedPosts(limit = 20, cursor?: string) {
  return prisma.post.findMany({
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: postInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: postInclude,
  });
}

export async function getUserPosts(userId: string, limit = 20, cursor?: string) {
  return prisma.post.findMany({
    where: { authorId: userId },
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: postInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserPostCount(userId: string) {
  return prisma.post.count({ where: { authorId: userId } });
}

export type FeedPostData = Awaited<ReturnType<typeof getFeedPosts>>[number];

export function getPostImageUrls(post: FeedPostData): string[] {
  const fromImages = post.images.map((i) => i.media.url);
  if (fromImages.length > 0) return fromImages;
  if (post.media?.url) return [post.media.url];
  return [];
}
