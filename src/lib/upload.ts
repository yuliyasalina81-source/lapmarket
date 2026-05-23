import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Допустимы только JPEG, PNG и WebP";
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return "Максимальный размер файла — 5 МБ";
  }
  return null;
}

function safeFolderPrefix(folder: string): string {
  const cleaned = folder.replace(/[^a-z0-9_-]/gi, "").slice(0, 32);
  return cleaned || "file";
}

function buildFilename(file: File, folder: string): string {
  const ext =
    EXT_BY_MIME[file.type] ??
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ??
    "jpg";
  const prefix = safeFolderPrefix(folder);
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
}

/** Saves image to public/uploads and returns public URL /uploads/... */
export async function saveUploadedFile(
  file: File,
  folder = "uploads"
): Promise<{ url: string; pathname: string }> {
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = buildFilename(file, folder);
  const filepath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const pathname = `uploads/${filename}`;
  return { url: `/${pathname}`, pathname };
}

/** @deprecated use saveUploadedFile */
export const uploadToBlob = saveUploadedFile;

export async function deleteUploadedFile(pathname: string): Promise<void> {
  const relative = pathname.startsWith("uploads/")
    ? pathname
    : pathname.startsWith("/uploads/")
      ? pathname.slice(1)
      : `uploads/${pathname}`;

  const filepath = path.join(process.cwd(), "public", relative);
  try {
    await unlink(filepath);
  } catch {
    // file may already be removed
  }
}

/** @deprecated use deleteUploadedFile */
export const deleteFromBlob = deleteUploadedFile;
