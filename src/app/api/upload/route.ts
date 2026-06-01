/** POST /api/upload — загрузка изображения в public/uploads (требуется сессия) */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, validateImageFile } from "@/lib/upload";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Необходима авторизация" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string)?.trim() || "uploads";

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Выберите файл" }, { status: 400 });
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { url, pathname } = await saveUploadedFile(file, folder);

    const media = await prisma.mediaAsset.create({
      data: {
        userId: session.user.id,
        url,
        pathname,
        mimeType: file.type,
        size: file.size,
      },
    });

    return NextResponse.json({
      url: media.url,
      mediaId: media.id,
      pathname: media.pathname,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ошибка загрузки";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

