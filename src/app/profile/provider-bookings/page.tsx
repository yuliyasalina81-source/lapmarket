/** Server Component */
/** /profile/provider-bookings — записи клиентов у провайдера услуг */
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProviderBookings } from "@/lib/queries/services";
import { ensureServiceProviderForUser } from "@/lib/specialist-prisma";
import { ProviderBookingsView } from "@/components/profile/provider-bookings-view";

export const metadata = { title: "Записи клиентов — ЛапМаркет" };

export default async function ProviderBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (session.user.role === "SPECIALIST") {
    await ensureServiceProviderForUser(session.user.id);
  }

  const bookings = await getProviderBookings(session.user.id);
  if (bookings.length === 0) {
    const isProvider = await import("@/lib/prisma").then(({ prisma }) =>
      prisma.serviceProvider.findFirst({ where: { userId: session.user!.id } })
    );
    if (!isProvider) redirect("/profile");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/profile" className="text-sm text-emerald-700 hover:underline">
        ← Профиль
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900">Записи клиентов</h1>
      <ProviderBookingsView bookings={bookings} />
    </div>
  );
}
