"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { uploadImage } from "@/actions/media";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createPost(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const content = (formData.get("content") as string)?.trim();
    const petId = (formData.get("petId") as string)?.trim() || undefined;
    const petName = (formData.get("petName") as string)?.trim() || undefined;
    const tagsRaw = (formData.get("tags") as string)?.trim();
    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

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

    let mediaId: string | undefined;
    const file = formData.get("file");
    if (file instanceof File && file.size > 0) {
      const uploadForm = new FormData();
      uploadForm.set("file", file);
      const result = await uploadImage(uploadForm, "posts");
      if (!result.ok) return { ok: false, error: result.error };
      mediaId = result.mediaId;
    }

    await prisma.post.create({
      data: {
        authorId: user.id,
        content,
        petId: resolvedPetId,
        petName: resolvedPetName,
        tags,
        mediaId,
      },
    });

    revalidatePath("/feed");
    revalidatePath("/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось опубликовать пост" };
  }
}

export async function togglePostLike(postId: string): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.postLike.create({ data: { postId, userId: user.id } });
    }

    revalidatePath("/feed");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}

export async function addComment(
  postId: string,
  content: string
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const text = content.trim();
    if (!text) return { ok: false, error: "Введите комментарий" };

    await prisma.comment.create({
      data: { postId, authorId: user.id, content: text },
    });

    revalidatePath("/feed");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось добавить комментарий" };
  }
}
