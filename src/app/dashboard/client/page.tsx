import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientAppointments } from "@/lib/queries/services-supabase";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { ClientAppointments } from "@/components/dashboard/client-appointments";
import { getUserBookings } from "@/lib/queries/services";

export const metadata = { title: "Мои записи — ЛапМаркет" };

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const appointments = isSupabaseConfigured()
    ? await getClientAppointments(session.user.id)
    : null;

  const prismaBookings = !isSupabaseConfigured()
    ? await getUserBookings(session.user.id)
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/profile" className="text-sm text-emerald-700 hover:underline">
        ← Профиль
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900">Мои записи</h1>
      <p className="mt-1 text-sm text-stone-500">
        <Link href="/services" className="text-emerald-700 hover:underline">
          Записаться снова
        </Link>
      </p>
      <ClientAppointments
        supabaseAppointments={appointments}
        prismaBookings={prismaBookings}
      />
    </div>
  );
}
