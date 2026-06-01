"use client";

/** Client Component */
/** Список записей в кабинете специалиста */

import { useTransition } from "react";
import { toast } from "sonner";
import { updateAppointmentStatus } from "@/actions/services-supabase";
import type { AppointmentStatus } from "@/lib/supabase/database.types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждена",
  completed: "Выполнена",
  cancelled: "Отменена",
};

/**
 * Таблица приёмов с фильтром по статусу
 */
export function AppointmentsList({
  appointments,
}: {
  appointments: Array<{
    id: string;
    appointment_time: string;
    status: string;
    note: string | null;
    clientName?: string;
    services: { name: string; price: number } | null;
  }>;
}) {
  const [pending, startTransition] = useTransition();

  const setStatus = (id: string, status: AppointmentStatus) => {
    startTransition(async () => {
      const r = await updateAppointmentStatus(id, status);
      if (r.ok) toast.success("Статус обновлён");
      else toast.error(r.error);
    });
  };

  if (appointments.length === 0) {
    return (
      <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Записи</h2>
        <p className="mt-2 text-sm text-stone-500">Пока нет записей</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Записи клиентов</h2>
      <ul className="mt-4 space-y-3">
        {appointments.map((a) => (
          <li
            key={a.id}
            className="rounded-xl border border-stone-100 p-3 text-sm"
          >
            <p className="font-medium text-stone-900">{a.clientName ?? "Клиент"}</p>
            <p className="text-stone-600">
              {a.services?.name} ·{" "}
              {new Date(a.appointment_time).toLocaleString("ru-RU")}
            </p>
            <p className="text-xs text-stone-500">
              {STATUS_LABELS[a.status] ?? a.status}
            </p>
            {a.note && <p className="mt-1 text-stone-500">{a.note}</p>}
            {a.status === "pending" && (
              <div className="mt-2 flex flex-wrap gap-2">
                <ActionBtn
                  disabled={pending}
                  onClick={() => setStatus(a.id, "confirmed")}
                  label="Подтвердить"
                />
                <ActionBtn
                  disabled={pending}
                  onClick={() => setStatus(a.id, "cancelled")}
                  label="Отклонить"
                  danger
                />
              </div>
            )}
            {a.status === "confirmed" && (
              <div className="mt-2">
                <ActionBtn
                  disabled={pending}
                  onClick={() => setStatus(a.id, "completed")}
                  label="Выполнено"
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Кнопка подтверждения/отмены записи в списке приёмов
 */
function ActionBtn({
  onClick,
  label,
  disabled,
  danger,
}: {
  onClick: () => void;
  label: string;
  disabled: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-3 py-1 text-xs font-semibold ${
        danger
          ? "bg-red-50 text-red-700"
          : "bg-emerald-50 text-emerald-800"
      } disabled:opacity-50`}
    >
      {label}
    </button>
  );
}
