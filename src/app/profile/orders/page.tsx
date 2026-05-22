import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Мои заказы — ЛапМаркет" };

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
          orders.map((o) => (
            <li key={o.id} className="rounded-2xl border bg-white p-4">
              <p className="font-medium">{o.seller.displayName}</p>
              <p className="text-sm text-stone-500">{o.status}</p>
              <ul className="mt-2 text-sm">
                {o.items.map((i) => (
                  <li key={i.product.id}>{i.product.title} × {i.quantity}</li>
                ))}
              </ul>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
