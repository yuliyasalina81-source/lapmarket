"use client";

/** Client Component */
/** Дашборд специалиста (legacy) */

import { ProfileForm } from "./profile-form";
import { LicenseUpload } from "./license-upload";
import { ServicesCrud } from "./services-crud";
import { AvailabilityEditor } from "./availability-editor";
import { AppointmentsList } from "./appointments-list";

const VERIFICATION_LABELS: Record<string, string> = {
  pending: "На проверке",
  approved: "Одобрен — вы в каталоге",
  rejected: "Отклонён — обновите данные и лицензию",
};

/**
 * Кабинет специалиста: записи и услуги
 */
export function SpecialistDashboard({
  profile,
  prismaUser,
  services,
  rules,
  appointments,
}: {
  profile: {
    id: string;
    kind: string;
    about: string | null;
    address: string;
    license_url: string | null;
    verification_status: string;
    specialties: string[];
  } | null;
  prismaUser: {
    displayName: string | null;
    city: string | null;
    email: string | null;
  } | null;
  services: Array<{
    id: string;
    name: string;
    duration_minutes: number;
    price: number;
    description: string | null;
  }>;
  rules: Array<{
    id: string;
    weekday: number;
    start_time: string;
    end_time: string;
    break_start: string | null;
    break_end: string | null;
  }>;
  appointments: Array<{
    id: string;
    appointment_time: string;
    status: string;
    note: string | null;
    clientName?: string;
    services: { name: string; price: number } | null;
  }>;
}) {
  if (!profile) {
    return (
      <p className="mt-6 text-stone-600">
        Профиль специалиста не найден. Зарегистрируйтесь как специалист.
      </p>
    );
  }

  const statusClass =
    profile.verification_status === "approved"
      ? "bg-emerald-50 text-emerald-800"
      : profile.verification_status === "rejected"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-800";

  return (
    <div className="mt-6 space-y-8">
      <p className={`rounded-xl px-4 py-3 text-sm font-medium ${statusClass}`}>
        {VERIFICATION_LABELS[profile.verification_status] ??
          profile.verification_status}
      </p>

      <ProfileForm
        defaultValues={{
          fullName: prismaUser?.displayName ?? "",
          city: prismaUser?.city ?? "",
          address: profile.address,
          about: profile.about ?? "",
          phone: "",
        }}
      />

      <LicenseUpload currentUrl={profile.license_url} />

      <ServicesCrud services={services} />

      <AvailabilityEditor rules={rules} />

      <AppointmentsList appointments={appointments} />
    </div>
  );
}
