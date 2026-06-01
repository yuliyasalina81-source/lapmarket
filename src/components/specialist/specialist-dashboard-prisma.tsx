"use client";

/** Client Component */
/** Дашборд специалиста (Prisma) */

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { updatePrismaProviderProfile } from "@/actions/specialist-prisma";
import { ProviderBookingsView } from "@/components/profile/provider-bookings-view";
import { SERVICE_KIND_LABELS } from "@/lib/constants";
import type { ServiceKind, BookingStatus } from "@prisma/client";

/**
 * Кабинет специалиста с данными из Prisma
 */
export function SpecialistDashboardPrisma({
  provider,
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
  bookings: {
    id: string;
    scheduledAt: Date;
    status: BookingStatus;
    note: string | null;
    user: { displayName: string; email: string | null };
    pet: { name: string } | null;
    provider: { name: string };
  }[];
  supabaseConfigured: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-6 space-y-8">
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
          ? "Профиль проверен — вы в каталоге /services"
          : "На модерации — после проверки появитесь в каталоге"}
      </p>

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
            href={`/services/${provider.id}`}
            className="mt-3 inline-block text-sm text-emerald-700 hover:underline"
          >
            Как вас видят клиенты →
          </Link>
        )}
      </section>

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
    </div>
  );
}
