import { formatRating } from "@/lib/format";
import { Star } from "lucide-react";
import type { getProductReviews } from "@/lib/queries/products";

type Review = Awaited<ReturnType<typeof getProductReviews>>[number];

export function ProductReviews({
  reviews,
  rating,
  reviewCount,
}: {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}) {
  return (
    <section className="mt-12 border-t border-stone-100 pt-10">
      <h2 className="text-xl font-bold text-stone-900">Отзывы</h2>
      <div className="mt-2 flex items-center gap-2 text-stone-600">
        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
        <span className="font-semibold">{formatRating(rating)}</span>
        <span className="text-sm">({reviewCount} отзывов)</span>
      </div>
      <ul className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <li className="text-sm text-stone-500">Отзывов пока нет</li>
        ) : (
          reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-stone-100 bg-stone-50/50 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-stone-900">
                  {r.user.avatar} {r.user.displayName}
                </p>
                <span className="text-sm text-amber-600">{"★".repeat(r.rating)}</span>
              </div>
              {r.text && <p className="mt-2 text-sm text-stone-700">{r.text}</p>}
              <p className="mt-1 text-xs text-stone-400">
                {new Date(r.createdAt).toLocaleDateString("ru-RU")}
              </p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
