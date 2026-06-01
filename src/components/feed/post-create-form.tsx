"use client";

/** Client Component */
/** Публикация нового поста */

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createPost } from "@/actions/posts";
import { ImageUpload } from "@/components/ui/image-upload";

/**
 * Форма создания поста с фото
 */
export function PostCreateForm({
  pets,
}: {
  pets: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createPost(formData);
      if (result.ok) {
        toast.success("Пост опубликован");
        router.push("/feed");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5">
      <Link href="/feed" className="text-sm text-emerald-700 hover:underline">
        ← Лента
      </Link>
      <h1 className="text-2xl font-bold text-stone-900">Новый пост</h1>

      <ImageUpload
        name="mediaIds"
        folder="posts"
        multiple
        maxFiles={5}
        label="Фото (до 5)"
      />

      <div>
        <label className="text-sm font-medium text-stone-700">Питомец</label>
        {pets.length > 0 ? (
          <select
            name="petId"
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          >
            <option value="">Без привязки</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            name="petName"
            type="text"
            placeholder="Имя питомца"
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          />
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-stone-700">Текст *</label>
        <textarea
          name="content"
          required
          rows={5}
          placeholder="Чем хотите поделиться?"
          className="mt-1 w-full resize-none rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-stone-700">Теги</label>
        <input
          name="tags"
          type="text"
          placeholder="корм, собака (через запятую)"
          className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Публикация..." : "Опубликовать"}
      </button>
    </form>
  );
}
