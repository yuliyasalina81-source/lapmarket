/**
 * Запросы ленты постов: фид, карточка, посты пользователя и URL картинок.
 */
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

/**
 * Лента постов с курсорной пагинацией.
 * @param limit Размер страницы
 * @param cursor id последнего поста предыдущей страницы
 */
export async function getFeedPosts(limit = 20, cursor?: string) {
  return prisma.post.findMany({
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: postInclude,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Один пост с автором, лайками и комментариями.
 * @param id id поста
 */
export async function getPostById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: postInclude,
  });
}

/**
 * Посты конкретного автора.
 * @param userId id автора
 * @param limit Размер страницы
 * @param cursor Курсор пагинации
 */
export async function getUserPosts(userId: string, limit = 20, cursor?: string) {
  return prisma.post.findMany({
    where: { authorId: userId },
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: postInclude,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Количество постов пользователя.
 * @param userId id автора
 */
export async function getUserPostCount(userId: string) {
  return prisma.post.count({ where: { authorId: userId } });
}

export type FeedPostData = Awaited<ReturnType<typeof getFeedPosts>>[number];

/**
 * Собирает URL изображений поста (gallery или legacy media).
 * @param post Пост с include images/media
 * @returns Массив URL
 */
export function getPostImageUrls(post: FeedPostData): string[] {
  const fromImages = post.images.map((i) => i.media.url);
  if (fromImages.length > 0) return fromImages;
  if (post.media?.url) return [post.media.url];
  return [];
}
