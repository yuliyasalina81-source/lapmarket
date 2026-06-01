/** Server Component */
/** /profile/orders — заказы и запросы товаров покупателя */
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { OrderReviewSection } from "@/components/profile/order-review-section";

export const metadata = { title: "Мои заказы — ЛапМаркет" };

const STATUS_LABELS: Record<string, string> = {
  NEW: "Новый",
  CONFIRMED: "Подтверждён",
  CANCELLED: "Отменён",
};

export default async function ProfileOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await prisma.orderRequest.findMany({
    where: { buyerId: session.user.id },
    include: {
      seller: { select: { displayName: true } },
      items: { include: { product: { select: { title: true, id: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const reviewed = await prisma.productReview.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  const reviewedProductIds = reviewed.map((r) => r.productId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/profile" className="text-sm text-emerald-700 hover:underline">
        ← Профиль
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Мои запросы в магазин</h1>
      <ul className="mt-8 space-y-4">
        {orders.length === 0 ? (
          <li className="text-stone-500">Запросов пока нет</li>
        ) : (
          orders.map((o) => {
            const total = o.items.reduce(
              (s, i) => s + i.priceAtOrder * i.quantity,
              0
            );
            return (
              <li key={o.id} className="rounded-2xl border bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{o.seller.displayName}</p>
                    <p className="text-sm text-stone-500">
                      {new Date(o.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      o.status === "CONFIRMED"
                        ? "bg-emerald-100 text-emerald-800"
                        : o.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-emerald-700">
                  {formatPrice(total)}
                </p>
                <ul className="mt-2 text-sm">
                  {o.items.map((i) => (
                    <li key={i.id}>
                      <Link
                        href={`/market/${i.product.id}`}
                        className="text-emerald-700 hover:underline"
                      >
                        {i.product.title}
                      </Link>{" "}
                      × {i.quantity}
                    </li>
                  ))}
                </ul>
                {o.message && (
                  <p className="mt-2 text-sm text-stone-500">{o.message}</p>
                )}
                <OrderReviewSection
                  orderId={o.id}
                  status={o.status}
                  items={o.items}
                  reviewedProductIds={reviewedProductIds}
                />
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
