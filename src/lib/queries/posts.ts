import { prisma } from "@/lib/prisma";

const postInclude = {
  author: { select: { id: true, displayName: true, avatar: true } },
  pet: { select: { id: true, name: true } },
  media: true,
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

export async function getUserPostCount(userId: string) {
  return prisma.post.count({ where: { authorId: userId } });
}

export type FeedPostData = Awaited<ReturnType<typeof getFeedPosts>>[number];
