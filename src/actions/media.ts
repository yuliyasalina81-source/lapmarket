/** Server Actions для загрузки медиа */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/upload";

export type UploadResult =
  | { ok: true; mediaId: string; url: string }
  | { ok: false; error: string };

/**
 * Загружает файл на диск и создаёт MediaAsset.
 * @param formData — поле file
 * @param folder — подпапка хранения (по умолчанию uploads)
 * @returns UploadResult с mediaId и url
 */
export async function uploadImage(
  formData: FormData,
  folder = "uploads"
): Promise<UploadResult> {
  try {
    const user = await requireSessionUser();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Выберите файл" };
    }

    const { url, pathname } = await saveUploadedFile(file, folder);

    const media = await prisma.mediaAsset.create({
      data: {
        userId: user.id,
        url,
        pathname,
        mimeType: file.type,
        size: file.size,
      },
    });

    return { ok: true, mediaId: media.id, url };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Ошибка загрузки",
    };
  }
}

/**
 * Удаляет медиа с диска и из БД (только владелец).
 * @param mediaId — идентификатор MediaAsset
 * @returns объект { ok: boolean }
 */
export async function deleteMedia(mediaId: string): Promise<{ ok: boolean }> {
  const user = await requireSessionUser();
  const media = await prisma.mediaAsset.findUnique({ where: { id: mediaId } });
  if (!media || media.userId !== user.id) {
    return { ok: false };
  }
  await deleteUploadedFile(media.pathname);
  await prisma.mediaAsset.delete({ where: { id: mediaId } });
  revalidatePath("/");
  return { ok: true };
}

