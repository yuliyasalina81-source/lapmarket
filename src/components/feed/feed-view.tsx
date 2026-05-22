"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { PostCard } from "./post-card";
import { Modal } from "@/components/ui/modal";
import { StaggerGrid, StaggerItem } from "@/components/ui/stagger-grid";
import { ImageUpload } from "@/components/ui/image-upload";
import { createPost } from "@/actions/posts";
import type { FeedPostData } from "@/lib/queries/posts";

export function FeedView({
  posts,
  currentUserId,
  pets = [],
}: {
  posts: FeedPostData[];
  currentUserId?: string;
  pets?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await createPost(formData);
      if (result.ok) {
        toast.success("Пост опубликован");
        setCreateOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Лента</h1>
        <p className="mt-2 text-stone-600">
          Соцсеть владельцев ЛапМаркет — посты, лайки и забота о питомцах
        </p>
      </motion.div>

      {currentUserId ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setCreateOpen(true)}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/50 py-4 text-sm font-semibold text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-50"
        >
          <ImagePlus className="h-5 w-5" />
          Создать пост
        </motion.button>
      ) : (
        <p className="mt-8 rounded-2xl bg-stone-50 px-4 py-3 text-center text-sm text-stone-600">
          <a href="/login" className="font-semibold text-emerald-700 hover:underline">
            Войдите
          </a>
          , чтобы публиковать посты
        </p>
      )}

      <StaggerGrid className="mt-8 flex flex-col gap-5">
        {posts.length === 0 ? (
          <p className="text-center text-stone-500">Пока нет постов. Будьте первым!</p>
        ) : (
          posts.map((post) => (
            <StaggerItem key={post.id}>
              <PostCard post={post} currentUserId={currentUserId} />
            </StaggerItem>
          ))
        )}
      </StaggerGrid>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Новый пост"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload name="file" label="Добавить фото" />
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
            <label className="text-sm font-medium text-stone-700">Текст</label>
            <textarea
              name="content"
              required
              rows={4}
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
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
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
      </Modal>
    </div>
  );
}
