import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SellerOrdersView } from "@/components/seller/seller-orders-view";

export const metadata = { title: "Запросы покупателей — ЛапМаркет" };

export default async function SellerOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "SELLER") redirect("/profile");

  const orders = await prisma.orderRequest.findMany({
    where: { sellerId: session.user.id },
    include: {
      buyer: { select: { displayName: true, email: true } },
      items: { include: { product: { select: { title: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/profile" className="text-sm text-emerald-700 hover:underline">
        ← Профиль
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Запросы покупателей</h1>
      <SellerOrdersView orders={orders} />
    </div>
  );
}
