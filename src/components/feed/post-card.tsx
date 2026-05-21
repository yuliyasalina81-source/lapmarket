"use client";

import type { FeedPost } from "@/types";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function PostCard({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [pop, setPop] = useState(false);

  const toggleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      setLikes((c) => (next ? c + 1 : c - 1));
      if (next) {
        setPop(true);
        setTimeout(() => setPop(false), 350);
      }
      return next;
    });
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm shadow-stone-900/5 transition hover:shadow-lg hover:shadow-emerald-900/5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 text-xl ring-2 ring-white">
          {post.authorAvatar}
        </span>
        <div>
          <p className="font-semibold text-stone-900">{post.authorName}</p>
          <p className="text-xs text-stone-500">
            питомец: {post.petName} · {formatDate(post.createdAt)}
          </p>
        </div>
      </div>
      <p className="mt-4 leading-relaxed text-stone-700">{post.content}</p>
      {post.image && (
        <div className="mt-4 flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-50 to-emerald-50/50 text-5xl transition group-hover:scale-[1.01]">
          {post.image}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
          >
            #{tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex gap-5 border-t border-stone-100 pt-4 text-sm">
        <button
          type="button"
          onClick={toggleLike}
          className={`flex items-center gap-1.5 font-medium transition ${
            liked ? "text-red-500" : "text-stone-500 hover:text-red-500"
          }`}
        >
          <motion.span className={pop ? "like-pop inline-flex" : "inline-flex"}>
            <Heart
              className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`}
              aria-hidden
            />
          </motion.span>
          {likes}
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 font-medium text-stone-500 transition hover:text-emerald-700"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          {post.comments}
        </button>
      </div>
    </article>
  );
}
