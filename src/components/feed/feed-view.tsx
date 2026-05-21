"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Send } from "lucide-react";
import { feedPosts } from "@/lib/mock-data";
import { PostCard } from "./post-card";
import { Modal } from "@/components/ui/modal";
import { StaggerGrid, StaggerItem } from "@/components/ui/stagger-grid";

export function FeedView() {
  const [createOpen, setCreateOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const publish = () => {
    alert(
      preview || caption
        ? "Пост опубликован (демо). В продакшене — загрузка на сервер."
        : "Добавьте фото или текст поста."
    );
    setCreateOpen(false);
    setCaption("");
    setPreview(null);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          Лента
        </h1>
        <p className="mt-2 text-stone-600">
          Соцсеть владельцев ЛапМаркет — посты, лайки и забота о питомцах
        </p>
      </motion.div>

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

      <StaggerGrid className="mt-8 flex flex-col gap-5">
        {feedPosts.map((post) => (
          <StaggerItem key={post.id}>
            <PostCard post={post} />
          </StaggerItem>
        ))}
      </StaggerGrid>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Новый пост"
        size="md"
      >
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 py-10 transition hover:border-emerald-300 hover:bg-emerald-50/30">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          {preview ? (
            <span className="text-6xl">🖼️</span>
          ) : (
            <>
              <ImagePlus className="h-10 w-10 text-emerald-600" />
              <span className="mt-2 text-sm font-medium text-stone-600">
                Загрузить фото питомца
              </span>
            </>
          )}
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Расскажите о своём питомце..."
          rows={4}
          className="mt-4 w-full resize-none rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none ring-emerald-500/0 transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
        />
        <button
          type="button"
          onClick={publish}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600"
        >
          <Send className="h-4 w-4" />
          Опубликовать
        </button>
      </Modal>
    </div>
  );
}
