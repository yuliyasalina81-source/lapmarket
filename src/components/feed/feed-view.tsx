"use client";

/** Client Component */
/** Лента постов сообщества */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ImagePlus } from "lucide-react";
import { PostCard } from "./post-card";
import { StaggerGrid, StaggerItem } from "@/components/ui/stagger-grid";
import { loadMoreFeedPosts } from "@/actions/posts";
import type { FeedPostData } from "@/lib/queries/posts";

/**
 * Страница ленты с созданием и списком постов
 */
export function FeedView({
  posts: initialPosts,
  currentUserId,
  pets = [],
}: {
  posts: FeedPostData[];
  currentUserId?: string;
  pets?: { id: string; name: string }[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 20);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosts(initialPosts);
    setHasMore(initialPosts.length >= 20);
  }, [initialPosts]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || posts.length === 0) return;
    setLoadingMore(true);
    try {
      const more = await loadMoreFeedPosts(posts[posts.length - 1].id);
      if (more.length === 0) setHasMore(false);
      else {
        setPosts((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          return [...prev, ...more.filter((p) => !ids.has(p.id))];
        });
        if (more.length < 20) setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, posts]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Лента</h1>
        <p className="mt-2 text-stone-600">
          Соцсеть владельцев ЛапМаркет — посты, лайки и забота о питомцах
        </p>
      </motion.div>

      {currentUserId ? (
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Link
            href="/feed/new"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/50 py-4 text-sm font-semibold text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            <ImagePlus className="h-5 w-5" />
            Создать пост
          </Link>
        </motion.div>
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
              <PostCard
                post={post}
                currentUserId={currentUserId}
                pets={pets}
              />
            </StaggerItem>
          ))
        )}
      </StaggerGrid>

      <div ref={sentinelRef} className="h-8" />
      {loadingMore && (
        <p className="py-4 text-center text-sm text-stone-500">Загрузка...</p>
      )}
    </div>
  );
}
