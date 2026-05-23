"use client";

import { useState, useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { addToCart, cartCount, CART_KEY, getCart } from "@/lib/cart";
import { createOrderRequest } from "@/actions/orders";

export function CartButton({
  sellerId,
  productId,
}: {
  sellerId: string;
  productId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [count, setCount] = useState(0);

  const add = () => {
    addToCart(productId);
    setCount(cartCount());
    toast.success("Добавлено в корзину");
  };

  const checkout = () => {
    const cart = getCart();
    if (cart.length === 0) {
      toast.error("Корзина пуста");
      return;
    }
    startTransition(async () => {
      const result = await createOrderRequest(sellerId, cart);
      if (result.ok) {
        localStorage.removeItem(CART_KEY);
        setCount(0);
        toast.success("Запрос отправлен продавцу");
      } else toast.error(result.error);
    });
  };

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
      >
        В корзину
      </button>
      <button
        type="button"
        onClick={checkout}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        <ShoppingCart className="h-4 w-4" />
        {pending ? "Отправка..." : `Запрос продавцу${count ? ` (${count})` : ""}`}
      </button>
    </div>
  );
}
