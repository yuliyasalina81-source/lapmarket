"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

type ImageUploadProps = {
  name?: string;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  onPreviewChange?: (files: File[]) => void;
};

export function ImageUpload({
  name = "files",
  multiple = false,
  maxFiles = 6,
  label = "Загрузить фото",
  onPreviewChange,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ url: string; file: File }[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const limited = multiple ? selected.slice(0, maxFiles) : selected.slice(0, 1);
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    const next = limited.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));
    setPreviews(next);
    onPreviewChange?.(limited);

    if (inputRef.current) {
      const dt = new DataTransfer();
      limited.forEach((f) => dt.items.add(f));
      inputRef.current.files = dt.files;
    }
  };

  const removeAt = (index: number) => {
    const next = previews.filter((_, i) => i !== index);
    URL.revokeObjectURL(previews[index].url);
    setPreviews(next);
    onPreviewChange?.(next.map((p) => p.file));
    if (inputRef.current) {
      const dt = new DataTransfer();
      next.forEach((p) => dt.items.add(p.file));
      inputRef.current.files = dt.files;
    }
  };

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 py-8 transition hover:border-emerald-300 hover:bg-emerald-50/30">
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          className="hidden"
          onChange={handleChange}
        />
        <ImagePlus className="h-8 w-8 text-stone-400" />
        <span className="mt-2 text-sm font-medium text-stone-600">{label}</span>
        <span className="mt-1 text-xs text-stone-400">JPEG, PNG, WebP до 5 МБ</span>
      </label>

      {previews.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {previews.map((p, i) => (
            <div key={p.url} className="relative h-24 w-24 overflow-hidden rounded-xl">
              <Image src={p.url} alt="" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
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
