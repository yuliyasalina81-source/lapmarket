"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Send, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AvatarDisplay } from "@/components/ui/avatar-display";
import { ProductImage } from "@/components/ui/product-image";
import { togglePostLike, addComment, deletePost, deleteComment } from "@/actions/posts";
import { PostEditModal } from "./post-edit-modal";
import { getPostImageUrls, type FeedPostData } from "@/lib/queries/posts";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function PostCard({
  post,
  currentUserId,
  pets = [],
}: {
  post: FeedPostData;
  currentUserId?: string;
  pets?: { id: string; name: string }[];
}) {
  const [liked, setLiked] = useState(
    currentUserId ? post.likes.some((l) => l.userId === currentUserId) : false
  );
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pop, setPop] = useState(false);

  const imageUrls = getPostImageUrls(post);
  const isAuthor = currentUserId === post.authorId;

  const toggleLike = () => {
    if (!currentUserId) {
      toast.error("Войдите, чтобы ставить лайки");
      return;
    }
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => (next ? c + 1 : c - 1));
    if (next) {
      setPop(true);
      setTimeout(() => setPop(false), 350);
    }
    startTransition(async () => {
      const result = await togglePostLike(post.id);
      if (!result.ok) {
        setLiked(!next);
        setLikeCount((c) => (next ? c - 1 : c + 1));
        toast.error(result.error);
      }
    });
  };

  const submitComment = () => {
    if (!currentUserId) {
      toast.error("Войдите, чтобы комментировать");
      return;
    }
    startTransition(async () => {
      const result = await addComment(post.id, commentText);
      if (result.ok) {
        setCommentText("");
        toast.success("Комментарий добавлен");
        setShowComments(true);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Удалить пост?")) return;
    startTransition(async () => {
      const result = await deletePost(post.id);
      if (result.ok) {
        toast.success("Пост удалён");
        router.refresh();
      } else toast.error(result.error);
    });
  };

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm shadow-stone-900/5 transition hover:shadow-lg hover:shadow-emerald-900/5">
      <div className="flex items-center gap-3">
        <Link href={`/users/${post.author.id}`}>
          <AvatarDisplay
            avatar={post.author.avatar}
            name={post.author.displayName}
            size={44}
          />
        </Link>
        <div className="flex-1">
          <Link
            href={`/users/${post.author.id}`}
            className="font-semibold text-stone-900 hover:text-emerald-700"
          >
            {post.author.displayName}
          </Link>
          <p className="text-xs text-stone-500">
            {(post.pet?.name ?? post.petName)
              ? `питомец: ${post.pet?.name ?? post.petName} · `
              : ""}
            {formatDate(post.createdAt)}
          </p>
        </div>
        {isAuthor && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              aria-label="Редактировать"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <p className="mt-4 leading-relaxed text-stone-700">{post.content}</p>
      {imageUrls.length > 0 && (
        <div
          className={`mt-4 grid gap-2 ${
            imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {imageUrls.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className={`relative overflow-hidden rounded-2xl ${
                imageUrls.length === 1 ? "h-64" : "h-40"
              }`}
            >
              <ProductImage src={url} alt="" fill className="rounded-2xl" />
            </button>
          ))}
        </div>
      )}
      {lightboxIndex !== null && imageUrls[lightboxIndex] && (
        <ImageLightbox
          src={imageUrls[lightboxIndex]}
          alt="Фото в посте"
          open
          onClose={() => setLightboxIndex(null)}
        />
      )}
      {post.tags.length > 0 && (
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
      )}
      <div className="mt-4 flex gap-5 border-t border-stone-100 pt-4 text-sm">
        <button
          type="button"
          onClick={toggleLike}
          disabled={pending}
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
          {likeCount}
        </button>
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 font-medium text-stone-500 transition hover:text-emerald-700"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          {post._count.comments}
        </button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-3 border-t border-stone-100 pt-4">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <AvatarDisplay
                avatar={c.author.avatar}
                name={c.author.displayName}
                size={32}
              />
              <div className="flex-1">
                <p className="text-xs font-semibold text-stone-800">
                  {c.author.displayName}
                </p>
                <p className="text-sm text-stone-600">{c.content}</p>
              </div>
              {currentUserId === c.author.id && (
                <button
                  type="button"
                  onClick={() =>
                    startTransition(async () => {
                      const result = await deleteComment(c.id);
                      if (result.ok) router.refresh();
                      else toast.error(result.error);
                    })
                  }
                  className="text-xs text-red-500 hover:underline"
                >
                  Удалить
                </button>
              )}
            </div>
          ))}
          {currentUserId && (
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Написать комментарий..."
                className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                onClick={submitComment}
                disabled={pending}
                className="rounded-xl bg-emerald-600 p-2 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {isAuthor && (
        <PostEditModal
          post={post}
          pets={pets}
          open={editOpen}
          onClose={() => setEditOpen(false)}
        />
      )}
    </article>
  );
}
