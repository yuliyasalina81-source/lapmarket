/** Server Actions для ленты и постов */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { createNotification } from "@/lib/notifications";
import { getFeedPosts } from "@/lib/queries/posts";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function resolveMediaIdsFromForm(
  formData: FormData,
  userId: string
): Promise<string[]> {
  const raw = formData
    .getAll("mediaIds")
    .map((v) => String(v).trim())
    .filter(Boolean);
  if (raw.length === 0) return [];

  const owned = await prisma.mediaAsset.findMany({
    where: { id: { in: raw }, userId },
    select: { id: true },
  });
  const ownedSet = new Set(owned.map((m) => m.id));
  return raw.filter((id) => ownedSet.has(id));
}

async function attachPostImages(postId: string, mediaIds: string[]) {
  let order = await prisma.postImage.count({ where: { postId } });
  for (const mediaId of mediaIds) {
    await prisma.postImage.create({
      data: { postId, mediaId, sortOrder: order++ },
    });
  }
  if (mediaIds.length > 0) {
    await prisma.post.update({
      where: { id: postId },
      data: { mediaId: mediaIds[0] },
    });
  }
}

function parsePostFields(formData: FormData) {
  const content = (formData.get("content") as string)?.trim();
  const petId = (formData.get("petId") as string)?.trim() || undefined;
  const petName = (formData.get("petName") as string)?.trim() || undefined;
  const tagsRaw = (formData.get("tags") as string)?.trim();
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];
  return { content, petId, petName, tags };
}

/**
 * Публикует пост в ленту с опциональными медиа и привязкой к питомцу.
 * @param formData — content, petId, tags, mediaIds
 * @returns ActionResult
 */
export async function createPost(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const { content, petId, petName, tags } = parsePostFields(formData);

    if (!content) {
      return { ok: false, error: "Добавьте текст поста" };
    }

    let resolvedPetId = petId;
    let resolvedPetName = petName;
    if (petId) {
      const pet = await prisma.pet.findFirst({
        where: { id: petId, userId: user.id },
      });
      if (pet) {
        resolvedPetId = pet.id;
        resolvedPetName = pet.name;
      } else {
        resolvedPetId = undefined;
      }
    }

    const mediaIds = await resolveMediaIdsFromForm(formData, user.id);

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        content,
        petId: resolvedPetId,
        petName: resolvedPetName,
        tags,
        mediaId: mediaIds[0],
      },
    });

    await attachPostImages(post.id, mediaIds);

    revalidatePath("/feed");
    revalidatePath("/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось опубликовать пост" };
  }
}

/**
 * Редактирует пост автора.
 * @param postId — идентификатор поста
 * @param formData — поля поста и mediaIds
 * @returns ActionResult
 */
export async function updatePost(postId: string, formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.authorId !== user.id) {
      return { ok: false, error: "Пост не найден" };
    }

    const { content, petId, petName, tags } = parsePostFields(formData);
    if (!content) return { ok: false, error: "Добавьте текст поста" };

    let resolvedPetId = petId;
    let resolvedPetName = petName;
    if (petId) {
      const pet = await prisma.pet.findFirst({
        where: { id: petId, userId: user.id },
      });
      if (pet) {
        resolvedPetId = pet.id;
        resolvedPetName = pet.name;
      } else {
        resolvedPetId = undefined;
      }
    }

    await prisma.post.update({
      where: { id: postId },
      data: {
        content,
        petId: resolvedPetId,
        petName: resolvedPetName,
        tags,
      },
    });

    const mediaIds = await resolveMediaIdsFromForm(formData, user.id);
    await attachPostImages(postId, mediaIds);

    revalidatePath("/feed");
    revalidatePath(`/users/${user.id}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось обновить пост" };
  }
}

/**
 * Удаляет пост (автор или админ при asAdmin).
 * @param postId — идентификатор поста
 * @param asAdmin — режим удаления с панели администратора
 * @returns ActionResult
 */
export async function deletePost(postId: string, asAdmin = false): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return { ok: false, error: "Пост не найден" };
    if (!asAdmin && post.authorId !== user.id) {
      return { ok: false, error: "Недостаточно прав" };
    }
    if (asAdmin && user.role !== "ADMIN") {
      return { ok: false, error: "Недостаточно прав" };
    }

    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/feed");
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось удалить пост" };
  }
}

/**
 * Ставит или снимает лайк; уведомляет автора при новом лайке.
 * @param postId — идентификатор поста
 * @returns ActionResult
 */
export async function togglePostLike(postId: string): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) return { ok: false, error: "Пост не найден" };

    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.postLike.create({ data: { postId, userId: user.id } });
      if (post.authorId !== user.id) {
        await createNotification({
          userId: post.authorId,
          type: "POST_LIKE",
          title: "Новый лайк",
          body: `${user.displayName ?? "Кто-то"} оценил ваш пост`,
          link: "/feed",
        });
      }
    }

    revalidatePath("/feed");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}

/**
 * Добавляет комментарий к посту.
 * @param postId — идентификатор поста
 * @param content — текст комментария
 * @returns ActionResult
 */
export async function addComment(
  postId: string,
  content: string
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const text = content.trim();
    if (!text) return { ok: false, error: "Введите комментарий" };

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) return { ok: false, error: "Пост не найден" };

    await prisma.comment.create({
      data: { postId, authorId: user.id, content: text },
    });

    if (post.authorId !== user.id) {
      await createNotification({
        userId: post.authorId,
        type: "POST_COMMENT",
        title: "Новый комментарий",
        body: `${user.displayName ?? "Кто-то"}: ${text.slice(0, 80)}`,
        link: "/feed",
      });
    }

    revalidatePath("/feed");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось добавить комментарий" };
  }
}

/**
 * Удаляет комментарий (автор или ADMIN).
 * @param commentId — идентификатор комментария
 * @returns ActionResult
 */
export async function deleteComment(commentId: string): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return { ok: false, error: "Комментарий не найден" };
    if (comment.authorId !== user.id && user.role !== "ADMIN") {
      return { ok: false, error: "Недостаточно прав" };
    }

    await prisma.comment.delete({ where: { id: commentId } });
    revalidatePath("/feed");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось удалить комментарий" };
  }
}

/**
 * Подгружает следующую страницу ленты (пагинация по cursor).
 * @param cursor — идентификатор последнего поста на странице
 * @returns массив постов из getFeedPosts
 */
export async function loadMoreFeedPosts(cursor: string) {
  const posts = await getFeedPosts(20, cursor);
  return posts;
}
