"use client";

/** Client Component */
/** Блок отзыва на заказ в профиле */

import { ProductReviewForm } from "@/components/market/product-review-form";

/**
 * Секция отзыва о доставленном заказе
 */
export function OrderReviewSection({
  orderId,
  status,
  items,
  reviewedProductIds,
}: {
  orderId: string;
  status: string;
  items: { product: { id: string; title: string } }[];
  reviewedProductIds: string[];
}) {
  if (status !== "CONFIRMED") return null;

  const pending = items.filter((i) => !reviewedProductIds.includes(i.product.id));
  if (pending.length === 0) return null;

  return (
    <div className="mt-3 border-t border-stone-100 pt-3">
      <p className="text-sm font-medium text-stone-700">Оставить отзыв</p>
      {pending.map((i) => (
        <div key={i.product.id} className="mt-2">
          <p className="text-xs text-stone-500">{i.product.title}</p>
          <ProductReviewForm productId={i.product.id} orderRequestId={orderId} />
        </div>
      ))}
    </div>
  );
}
