"use client";

/** Client Component */
/** Добавление товара в корзину из карточки */

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";

/**
 * Кнопка «В корзину» с обновлением состояния
 */
export function AddToCartButton({ productId }: { productId: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        addToCart(productId);
        toast.success("Добавлено в корзину");
      }}
      className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
    >
      <ShoppingCart className="h-4 w-4" />
      В корзину
    </button>
  );
}
