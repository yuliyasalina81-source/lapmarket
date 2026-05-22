import { put, del } from "@vercel/blob";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Допустимы только JPEG, PNG и WebP";
  }
  if (file.size > MAX_SIZE) {
    return "Максимальный размер файла — 5 МБ";
  }
  return null;
}

export async function uploadToBlob(
  file: File,
  folder: string
): Promise<{ url: string; pathname: string }> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN не настроен. Добавьте токен Vercel Blob в .env"
    );
  }

  const ext = file.name.split(".").pop() || "jpg";
  const pathname = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(pathname, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteFromBlob(pathname: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  await del(pathname, { token: process.env.BLOB_READ_WRITE_TOKEN });
}
