"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { uploadLicense } from "@/actions/services-supabase";

export function LicenseUpload({ currentUrl }: { currentUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const upload = (file: File) => {
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const r = await uploadLicense(fd);
      if (r.ok) toast.success("Лицензия загружена, ожидайте проверки");
      else toast.error(r.error);
    });
  };

  return (
    <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Лицензия</h2>
      <p className="mt-1 text-xs text-stone-500">
        PDF или изображение. Без одобрения вы не появитесь в каталоге.
      </p>
      {currentUrl && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-emerald-700 hover:underline"
        >
          Текущий файл
        </a>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="mt-3 block w-full text-sm"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />
      {pending && <p className="mt-2 text-xs text-stone-500">Загрузка...</p>}
    </section>
  );
}
