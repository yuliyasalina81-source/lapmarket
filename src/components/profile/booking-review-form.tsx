"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createServiceReview } from "@/actions/services";

export function BookingReviewForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-3 space-y-2 border-t border-stone-100 pt-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await createServiceReview(bookingId, rating, text);
          if (r.ok) toast.success("Спасибо за отзыв!");
          else toast.error(r.error);
        });
      }}
    >
      <p className="text-xs font-medium text-stone-600">Оставить отзыв</p>
      <select
        value={rating}
        onChange={(e) => setRating(parseInt(e.target.value, 10))}
        className="rounded-lg border border-stone-200 px-2 py-1 text-sm"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} ★
          </option>
        ))}
      </select>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Комментарий"
        className="w-full rounded-lg border border-stone-200 px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-semibold text-emerald-700 hover:underline disabled:opacity-50"
      >
        Отправить
      </button>
    </form>
  );
}
