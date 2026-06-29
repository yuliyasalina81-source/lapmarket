"use client";

/** Вкладки кабинета специалиста (Prisma) */

import { useState } from "react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { updatePrismaProviderProfile } from "@/actions/specialist-prisma";
import { ProviderBookingsView } from "@/components/profile/provider-bookings-view";
import { ServicesCrudPrisma } from "@/components/specialist/services-crud-prisma";
import { AvailabilityEditorPrisma } from "@/components/specialist/availability-editor-prisma";
import { SlotManager } from "@/components/specialist/slot-manager";
import { SERVICE_KIND_LABELS } from "@/lib/constants";
import type { ServiceKind, BookingStatus, ServiceCategory } from "@prisma/client";

type Tab = "profile" | "services" | "bookings" | "schedule";

export function SpecialistDashboardTabs({
  provider,
  services,
  bookings,
  supabaseConfigured,
}: {
  provider: {
    id: string;
    name: string;
    kind: ServiceKind;
    city: string;
    address: string;
    verified: boolean;
    priceFrom: number;
  };
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    duration: number;
    category: ServiceCategory;
    isActive: boolean;
  }>;
  bookings: Array<{
    id: string;
    scheduledAt: Date;
    status: BookingStatus;
    note: string | null;
    user: { displayName: string; email: string | null };
    pet: { name: string } | null;
    provider: { name: string };
    service?: { name: string; price: number } | null;
  }>;
  supabaseConfigured: boolean;
}) {
  const [tab, setTab] = useState<Tab>("profile");
  const [pending, startTransition] = useTransition();

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Профиль" },
    { id: "services", label: `Услуги (${services.length})` },
    { id: "schedule", label: "Расписание" },
    { id: "bookings", label: `Записи (${bookings.length})` },
  ];

  return (
    <div className="mt-6 space-y-6">
      {!supabaseConfigured && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Работает базовый режим (без Supabase). Вы видите записи и можете редактировать
          профиль. Чтобы появиться в каталоге на всех устройствах — администратор
          должен подтвердить профиль или подключить Supabase на сервере.
        </p>
      )}

      <p
        className={`rounded-xl px-4 py-3 text-sm font-medium ${
          provider.verified
            ? "bg-emerald-50 text-emerald-800"
            : "bg-amber-50 text-amber-800"
        }`}
      >
        {provider.verified
          ? "Профиль проверен — вы в каталоге"
          : "На модерации — после проверки появитесь в каталоге"}
      </p>

      <nav className="flex gap-1 overflow-x-auto rounded-2xl bg-stone-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium sm:text-sm ${
              tab === t.id ? "bg-white text-emerald-800 shadow-sm" : "text-stone-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "profile" && (
        <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Профиль в каталоге</h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              startTransition(async () => {
                const r = await updatePrismaProviderProfile(new FormData(e.currentTarget));
                if (r.ok) toast.success("Сохранено");
                else toast.error(r.error);
              });
            }}
          >
            <input type="hidden" name="providerId" value={provider.id} />
            <input
              name="name"
              defaultValue={provider.name}
              required
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
              placeholder="Название / имя"
            />
            <select
              name="kind"
              defaultValue={provider.kind}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            >
              <option value="VETERINARY">{SERVICE_KIND_LABELS.VETERINARY}</option>
              <option value="GROOMING">{SERVICE_KIND_LABELS.GROOMING}</option>
              <option value="TRAINING">{SERVICE_KIND_LABELS.TRAINING}</option>
              <option value="BOARDING">{SERVICE_KIND_LABELS.BOARDING}</option>
              <option value="OTHER">{SERVICE_KIND_LABELS.OTHER}</option>
            </select>
            <input
              name="city"
              defaultValue={provider.city}
              required
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
              placeholder="Город"
            />
            <input
              name="address"
              defaultValue={provider.address}
              required
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
              placeholder="Адрес"
            />
            <input
              name="priceFrom"
              type="number"
              min={0}
              defaultValue={provider.priceFrom}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
              placeholder="Цена от, ₽"
            />
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Сохранение..." : "Сохранить"}
            </button>
          </form>
          {provider.verified && (
            <Link
              href={`/specialist/${provider.id}`}
              className="mt-3 inline-block text-sm text-emerald-700 hover:underline"
            >
              Как вас видят клиенты →
            </Link>
          )}
        </section>
      )}

      {tab === "services" && <ServicesCrudPrisma services={services} />}

      {tab === "schedule" && (
        <div className="space-y-4">
          <AvailabilityEditorPrisma />
          <SlotManager
            services={services.map((s) => ({
              id: s.id,
              name: s.name,
              duration: s.duration,
            }))}
          />
        </div>
      )}

      {tab === "bookings" && (
        <section>
          <h2 className="text-lg font-semibold text-stone-900">Записи клиентов</h2>
          {bookings.length === 0 ? (
            <p className="mt-4 text-sm text-stone-500">
              Пока нет записей.{" "}
              <Link href="/services" className="text-emerald-700 hover:underline">
                Каталог услуг
              </Link>
            </p>
          ) : (
            <ProviderBookingsView bookings={bookings} />
          )}
        </section>
      )}
    </div>
  );
}
