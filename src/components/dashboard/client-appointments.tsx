"use client";

/** Client Component */
/** Предстоящие записи клиента */

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateAppointmentStatus } from "@/actions/services-supabase";
import { updateBookingStatus } from "@/actions/services";
import { SERVICE_KIND_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждена",
  completed: "Выполнена",
  cancelled: "Отменена",
  NEW: "Новая",
  CONFIRMED: "Подтверждена",
  CANCELLED: "Отменена",
};

/**
 * Список ближайших приёмов владельца питомца
 */
export function ClientAppointments({
  supabaseAppointments,
  prismaBookings,
}: {
  supabaseAppointments: Array<{
    id: string;
    appointment_time: string;
    status: string;
    note: string | null;
    services: { name: string; price: number } | null;
    specialistName?: string;
    specialistKind?: string;
  }> | null;
  prismaBookings: Array<{
    id: string;
    scheduledAt: Date;
    status: string;
    note: string | null;
    provider: { name: string; kind: string };
  }> | null;
}) {
  const [pending, startTransition] = useTransition();

  const cancelSupabase = (id: string) => {
    startTransition(async () => {
      const r = await updateAppointmentStatus(id, "cancelled");
      if (r.ok) toast.success("Запись отменена");
      else toast.error(r.error);
    });
  };

  const cancelPrisma = (id: string) => {
    startTransition(async () => {
      const r = await updateBookingStatus(id, "CANCELLED");
      if (r.ok) toast.success("Запись отменена");
      else toast.error(r.error);
    });
  };

  if (supabaseAppointments) {
    if (supabaseAppointments.length === 0) {
      return (
        <p className="mt-8 text-stone-500">
          Записей пока нет.{" "}
          <Link href="/services" className="text-emerald-700 hover:underline">
            Записаться на услугу
          </Link>
        </p>
      );
    }

    return (
      <div className="mt-8 space-y-4">
        {supabaseAppointments.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-stone-100 bg-white p-4"
          >
            <p className="font-semibold text-stone-900">
              {a.specialistName ?? "Специалист"}
            </p>
            <p className="text-sm text-stone-500">
              {a.services?.name} · {formatPrice(a.services?.price ?? 0)}
            </p>
            <p className="mt-1 text-sm text-stone-600">
              {new Date(a.appointment_time).toLocaleString("ru-RU")}
            </p>
            <p className="text-xs text-stone-500">
              {STATUS_LABELS[a.status] ?? a.status}
            </p>
            {a.status !== "cancelled" && a.status !== "completed" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => cancelSupabase(a.id)}
                className="mt-3 text-sm font-medium text-red-600 hover:underline"
              >
                Отменить
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (!prismaBookings?.length) {
    return (
      <p className="mt-8 text-stone-500">
        Записей пока нет.{" "}
        <Link href="/services" className="text-emerald-700 hover:underline">
          Записаться на услугу
        </Link>
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {prismaBookings.map((b) => (
        <div
          key={b.id}
          className="rounded-2xl border border-stone-100 bg-white p-4"
        >
          <p className="font-semibold text-stone-900">{b.provider.name}</p>
          <p className="text-sm text-stone-500">
            {SERVICE_KIND_LABELS[b.provider.kind as keyof typeof SERVICE_KIND_LABELS]} ·{" "}
            {STATUS_LABELS[b.status] ?? b.status}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            {new Date(b.scheduledAt).toLocaleString("ru-RU")}
          </p>
          {b.status !== "CANCELLED" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => cancelPrisma(b.id)}
              className="mt-3 text-sm font-medium text-red-600 hover:underline"
            >
              Отменить
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
