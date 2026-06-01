"use client";

/** Client Component */
/** Отправка отзыва на купленный товар */

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createProductReview } from "@/actions/orders";

/**
 * Форма оценки и текста отзыва о товаре
 */
export function ProductReviewForm({
  productId,
  orderRequestId,
}: {
  productId: string;
  orderRequestId: string;
}) {
  const [rating, setRating] = useState(5);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-3 rounded-xl border border-stone-100 bg-stone-50 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const text = (formData.get("text") as string)?.trim();
        startTransition(async () => {
          const result = await createProductReview(
            productId,
            orderRequestId,
            rating,
            text || undefined
          );
          if (result.ok) toast.success("Отзыв отправлен");
          else toast.error(result.error);
        });
      }}
    >
      <p className="text-sm font-medium text-stone-700">Оценка</p>
      <div className="mt-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-xl ${n <= rating ? "text-amber-400" : "text-stone-300"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        name="text"
        rows={2}
        placeholder="Комментарий (необязательно)"
        className="mt-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "..." : "Отправить отзыв"}
      </button>
    </form>
  );
}
