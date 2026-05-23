"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updatePost } from "@/actions/posts";
import { Modal } from "@/components/ui/modal";
import { ImageUpload } from "@/components/ui/image-upload";
import type { FeedPostData } from "@/lib/queries/posts";

export function PostEditModal({
  post,
  pets,
  open,
  onClose,
}: {
  post: FeedPostData;
  pets: { id: string; name: string }[];
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updatePost(post.id, formData);
      if (result.ok) {
        toast.success("Пост обновлён");
        onClose();
        router.refresh();
      } else toast.error(result.error);
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Редактировать пост" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUpload
          name="mediaIds"
          folder="posts"
          multiple
          maxFiles={5}
          label="Добавить фото"
        />
        <div>
          <label className="text-sm font-medium text-stone-700">Питомец</label>
          {pets.length > 0 ? (
            <select
              name="petId"
              defaultValue={post.petId ?? ""}
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
              defaultValue={post.petName ?? ""}
              placeholder="Имя питомца"
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Текст</label>
          <textarea
            name="content"
            required
            rows={4}
            defaultValue={post.content}
            className="mt-1 w-full resize-none rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Теги</label>
          <input
            name="tags"
            type="text"
            defaultValue={post.tags.join(", ")}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </Modal>
  );
}
