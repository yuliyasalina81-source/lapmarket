"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export type UploadedImage = { mediaId: string; url: string };

type ImageUploadProps = {
  name?: string;
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  defaultImages?: UploadedImage[];
  onChange?: (images: UploadedImage[]) => void;
};

export function ImageUpload({
  name = "mediaIds",
  folder = "uploads",
  multiple = false,
  maxFiles = 6,
  label = "Загрузить фото",
  defaultImages = [],
  onChange,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>(defaultImages);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const updateImages = useCallback(
    (next: UploadedImage[]) => {
      setImages(next);
      onChange?.(next);
    },
    [onChange]
  );

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.size > 0);
    if (list.length === 0) return;

    const limit = multiple ? maxFiles - images.length : 1;
    if (limit <= 0) {
      toast.error(`Максимум ${maxFiles} фото`);
      return;
    }

    const toUpload = list.slice(0, limit);
    setUploading(true);

    try {
      const uploaded: UploadedImage[] = [];
      for (const file of toUpload) {
        const body = new FormData();
        body.set("file", file);
        body.set("folder", folder);

        const res = await fetch("/api/upload", { method: "POST", body });
        const data = (await res.json()) as {
          url?: string;
          mediaId?: string;
          error?: string;
        };

        if (!res.ok || !data.mediaId || !data.url) {
          toast.error(data.error ?? "Не удалось загрузить файл");
          continue;
        }
        uploaded.push({ mediaId: data.mediaId, url: data.url });
      }

      if (uploaded.length > 0) {
        const next = multiple ? [...images, ...uploaded] : uploaded;
        updateImages(next);
        toast.success(
          uploaded.length === 1 ? "Фото загружено" : `Загружено: ${uploaded.length}`
        );
      }
    } catch {
      toast.error("Ошибка сети при загрузке");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) void uploadFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;
    const files = e.dataTransfer.files;
    if (files?.length) void uploadFiles(files);
  };

  const removeAt = (index: number) => {
    updateImages(images.filter((_, i) => i !== index));
  };

  const canAddMore = multiple ? images.length < maxFiles : images.length === 0;

  return (
    <div>
      {canAddMore && (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-8 transition ${
            dragOver
              ? "border-emerald-400 bg-emerald-50/50"
              : "border-stone-200 bg-stone-50 hover:border-emerald-300 hover:bg-emerald-50/30"
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={multiple}
            className="hidden"
            onChange={handleChange}
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          ) : (
            <ImagePlus className="h-8 w-8 text-stone-400" />
          )}
          <span className="mt-2 text-sm font-medium text-stone-600">{label}</span>
          <span className="mt-1 text-xs text-stone-400">
            Перетащите или нажмите · JPEG, PNG, WebP до 5 МБ
          </span>
        </div>
      )}

      {images.map((img) =>
        multiple ? (
          <input key={img.mediaId} type="hidden" name={name} value={img.mediaId} />
        ) : (
          <input key={img.mediaId} type="hidden" name={name} value={img.mediaId} />
        )
      )}

      {images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={img.mediaId} className="relative h-24 w-24 overflow-hidden rounded-xl">
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                disabled={uploading}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                aria-label="Удалить"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
