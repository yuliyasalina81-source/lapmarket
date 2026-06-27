/** Server Component */
/** /dashboard/specialist — кабинет специалиста: расписание и записи */
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getAvailabilityRules,
  getSpecialistAppointments,
  getSpecialistForOwner,
  getSpecialistServices,
} from "@/lib/queries/services-supabase";
import {
  getProviderBookings,
  getProviderServices,
} from "@/lib/queries/services";
import { ensureServiceProviderForUser } from "@/lib/specialist-prisma";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { SpecialistDashboard } from "@/components/specialist/specialist-dashboard";
import { SpecialistDashboardTabs } from "@/components/specialist/specialist-dashboard-tabs";

export const metadata = { title: "Кабинет специалиста — ЛапМаркет" };

export default async function SpecialistDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role !== "SPECIALIST" && session.user.role !== "ADMIN") {
    redirect("/profile");
  }

  const supabaseOk = isSupabaseConfigured();

  if (!supabaseOk) {
    const provider = await ensureServiceProviderForUser(session.user.id);
    if (!provider) redirect("/profile");

    const bookings = await getProviderBookings(session.user.id);
    const services = await getProviderServices(provider.id);

    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link href="/profile" className="text-sm text-emerald-700 hover:underline">
          ← Профиль
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-stone-900">Кабинет специалиста</h1>
        <SpecialistDashboardTabs
          provider={provider}
          services={services}
          bookings={bookings}
          supabaseConfigured={false}
        />
      </div>
    );
  }

  const profile = await getSpecialistForOwner(session.user.id);

  if (!profile && session.user.role !== "ADMIN") {
    const provider = await ensureServiceProviderForUser(session.user.id);
    if (provider) {
      const bookings = await getProviderBookings(session.user.id);
      const services = await getProviderServices(provider.id);
      return (
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <Link href="/profile" className="text-sm text-emerald-700 hover:underline">
            ← Профиль
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-stone-900">Кабинет специалиста</h1>
          <p className="mt-2 text-sm text-stone-500">
            Профиль Supabase ещё не создан — работаете в базовом режиме.
          </p>
          <SpecialistDashboardTabs
            provider={provider}
            services={services}
            bookings={bookings}
            supabaseConfigured={true}
          />
        </div>
      );
    }
    redirect("/register");
  }

  const prismaUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { displayName: true, city: true, email: true },
  });

  const [services, rules, appointments] = profile
    ? await Promise.all([
        getSpecialistServices(profile.id),
        getAvailabilityRules(profile.id),
        getSpecialistAppointments(profile.id),
      ])
    : [[], [], []];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/profile" className="text-sm text-emerald-700 hover:underline">
        ← Профиль
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900">Кабинет специалиста</h1>
      <SpecialistDashboard
        profile={profile}
        prismaUser={prismaUser}
        services={services}
        rules={rules}
        appointments={appointments}
      />
    </div>
  );
}
