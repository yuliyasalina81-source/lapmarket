"use client";

/** Client Component */
/** Боковая панель корзины покупок */

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ShoppingCart, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createOrderRequest, type CartItem } from "@/actions/orders";
import { getCart, removeFromCart, setQuantity, type CartLine } from "@/lib/cart";

type ProductInfo = {
  id: string;
  title: string;
  price: number;
  sellerId: string;
  sellerName: string;
};

/**
 * Выдвижная корзина с товарами и оформлением
 */
export function CartDrawer({
  productsById,
}: {
  productsById: Record<string, ProductInfo>;
}) {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const refresh = () => setCart(getCart());

  useEffect(() => {
    refresh();
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("lapmarket-cart", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("lapmarket-cart", onStorage);
    };
  }, []);

  const lines = cart
    .map((line) => {
      const p = productsById[line.productId];
      if (!p) return null;
      return { ...line, product: p };
    })
    .filter(Boolean) as (CartLine & { product: ProductInfo })[];

  const total = lines.reduce(
    (s, l) => s + l.product.price * l.quantity,
    0
  );
  const count = lines.reduce((s, l) => s + l.quantity, 0);

  const bySeller = lines.reduce(
    (acc, line) => {
      const sid = line.product.sellerId;
      if (!acc[sid]) acc[sid] = { name: line.product.sellerName, items: [] };
      acc[sid].items.push(line);
      return acc;
    },
    {} as Record<string, { name: string; items: typeof lines }>
  );

  const removeLine = (productId: string) => {
    removeFromCart(productId);
    refresh();
  };

  const changeQty = (productId: string, delta: number) => {
    const line = cart.find((i) => i.productId === productId);
    if (!line) return;
    setQuantity(productId, line.quantity + delta);
    refresh();
  };

  const checkoutSeller = (sellerId: string, items: CartItem[]) => {
    startTransition(async () => {
      const result = await createOrderRequest(sellerId, items, message);
      if (result.ok) {
        for (const item of items) removeFromCart(item.productId);
        refresh();
        toast.success("Запрос отправлен продавцу");
        setMessage("");
        if (getCart().length === 0) setOpen(false);
      } else toast.error(result.error);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-700 md:bottom-8"
        aria-label="Корзина"
      >
        <ShoppingCart className="h-6 w-6" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div
            className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
            role="dialog"
            aria-label="Корзина"
          >
            <div className="flex items-center justify-between border-b border-stone-100 px-4 py-4">
              <h2 className="text-lg font-bold text-stone-900">Корзина</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-stone-100"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {lines.length === 0 ? (
                <p className="text-center text-stone-500">Корзина пуста</p>
              ) : (
                <ul className="space-y-3">
                  {lines.map((line) => (
                    <li
                      key={line.productId}
                      className="flex gap-3 rounded-xl border border-stone-100 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/market/${line.productId}`}
                          className="font-medium text-stone-900 hover:text-emerald-700"
                          onClick={() => setOpen(false)}
                        >
                          {line.product.title}
                        </Link>
                        <p className="text-xs text-stone-500">{line.product.sellerName}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => changeQty(line.productId, -1)}
                            className="h-7 w-7 rounded-lg border border-stone-200 text-sm hover:bg-stone-50"
                          >
                            −
                          </button>
                          <span className="text-sm">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => changeQty(line.productId, 1)}
                            className="h-7 w-7 rounded-lg border border-stone-200 text-sm hover:bg-stone-50"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-emerald-700">
                          {(line.product.price * line.quantity).toLocaleString(
                            "ru-RU"
                          )}{" "}
                          ₽
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.productId)}
                        className="text-stone-400 hover:text-red-600"
                        aria-label="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-stone-100 p-4">
                <p className="text-sm font-semibold text-stone-900">
                  Итого: {total.toLocaleString("ru-RU")} ₽
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Комментарий продавцу (необязательно)"
                  rows={2}
                  className="mt-3 w-full resize-none rounded-xl border border-stone-200 px-3 py-2 text-sm"
                />
                <div className="mt-3 space-y-2">
                  {Object.entries(bySeller).map(([sellerId, group]) => (
                    <button
                      key={sellerId}
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        checkoutSeller(
                          sellerId,
                          group.items.map((i) => ({
                            productId: i.productId,
                            quantity: i.quantity,
                          }))
                        )
                      }
                      className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {pending
                        ? "Отправка..."
                        : `Запрос в «${group.name}»`}
                    </button>
                  ))}
                </div>
                <Link
                  href="/profile/orders"
                  className="mt-3 block text-center text-sm text-emerald-700 hover:underline"
                  onClick={() => setOpen(false)}
                >
                  Мои заказы
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
