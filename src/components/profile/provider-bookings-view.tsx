"use client";

/** Client Component */
/** Записи специалиста как провайдера услуг */

import { useTransition } from "react";
import { toast } from "sonner";
import { updateBookingStatus } from "@/actions/services";
import type { BookingStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

/**
 * Список приёмов для ветеринара/грумера
 */
export function ProviderBookingsView({
  bookings,
}: {
  bookings: {
    id: string;
    scheduledAt: Date;
    status: BookingStatus;
    note: string | null;
    user: { displayName: string; email: string | null };
    pet: { name: string } | null;
    provider: { name: string };
  }[];
}) {
  const [pending, startTransition] = useTransition();

  const setStatus = (id: string, status: BookingStatus) => {
    startTransition(async () => {
      const r = await updateBookingStatus(id, status);
      if (r.ok) toast.success("Статус обновлён");
      else toast.error(r.error);
    });
  };

  return (
    <ul className="mt-8 space-y-4">
      {bookings.map((b) => (
        <li key={b.id} className="rounded-2xl border border-stone-100 bg-white p-4">
          <p className="font-medium">{b.user.displayName}</p>
          <p className="text-sm text-stone-500">
            {b.scheduledAt.toLocaleString("ru-RU")} · {b.status}
            {b.pet ? ` · ${b.pet.name}` : ""}
          </p>
          {b.note && <p className="mt-1 text-sm text-stone-600">{b.note}</p>}
          {b.status === "NEW" && (
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                disabled={pending}
                onClick={() => setStatus(b.id, "CONFIRMED")}
              >
                Подтвердить
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() => setStatus(b.id, "CANCELLED")}
              >
                Отменить
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
