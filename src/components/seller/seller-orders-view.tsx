"use client";

/** Client Component */
/** Заказы продавца: статусы и детали */

import { useTransition } from "react";
import { toast } from "sonner";
import { updateOrderRequestStatus } from "@/actions/orders";
import type { OrderRequestStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

/**
 * Таблица заказов магазина для продавца
 */
export function SellerOrdersView({
  orders,
}: {
  orders: {
    id: string;
    status: OrderRequestStatus;
    message: string | null;
    createdAt: Date;
    buyer: { displayName: string; email: string | null };
    items: { quantity: number; priceAtOrder: number; product: { title: string } }[];
  }[];
}) {
  const [pending, startTransition] = useTransition();

  const setStatus = (id: string, status: OrderRequestStatus) => {
    startTransition(async () => {
      const r = await updateOrderRequestStatus(id, status);
      if (r.ok) toast.success("Обновлено");
      else toast.error(r.error);
    });
  };

  return (
    <ul className="mt-8 space-y-4">
      {orders.length === 0 ? (
        <li className="text-stone-500">Запросов пока нет</li>
      ) : (
        orders.map((o) => (
          <li key={o.id} className="rounded-2xl border border-stone-100 bg-white p-4">
            <p className="font-medium">{o.buyer.displayName}</p>
            <p className="text-xs text-stone-500">{o.status} · {o.createdAt.toLocaleString("ru-RU")}</p>
            <ul className="mt-2 text-sm text-stone-600">
              {o.items.map((i, idx) => (
                <li key={idx}>
                  {i.product.title} × {i.quantity} — {i.priceAtOrder} ₽
                </li>
              ))}
            </ul>
            {o.message && <p className="mt-2 text-sm">{o.message}</p>}
            {o.status === "NEW" && (
              <div className="mt-3 flex gap-2">
                <Button disabled={pending} onClick={() => setStatus(o.id, "CONFIRMED")}>
                  Подтвердить
                </Button>
                <Button variant="secondary" disabled={pending} onClick={() => setStatus(o.id, "CANCELLED")}>
                  Отклонить
                </Button>
              </div>
            )}
          </li>
        ))
      )}
    </ul>
  );
}
