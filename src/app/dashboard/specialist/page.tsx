import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getAvailabilityRules,
  getSpecialistAppointments,
  getSpecialistForOwner,
  getSpecialistServices,
} from "@/lib/queries/services-supabase";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { SpecialistDashboard } from "@/components/specialist/specialist-dashboard";

export const metadata = { title: "Кабинет специалиста — ЛапМаркет" };

export default async function SpecialistDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role !== "SPECIALIST" && session.user.role !== "ADMIN") {
    redirect("/profile");
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-stone-600">
          Настройте Supabase (см. README). Пока используйте{" "}
          <Link href="/profile/provider-bookings" className="text-emerald-700">
            записи клиентов
          </Link>
          .
        </p>
      </div>
    );
  }

  const profile = await getSpecialistForOwner(session.user.id);
  if (!profile && session.user.role !== "ADMIN") {
    redirect("/register?role=specialist");
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
