"use client";

/** Выбор даты и слота через Prisma REST API */

import { useEffect, useMemo, useState, useTransition } from "react";
import { DEFAULT_GENERATION_DAYS } from "@/lib/services/prisma-slots";

export type SelectedPrismaSlot = {
  id: string;
  startAt: string;
};

type SlotOption = {
  id: string;
  startAt: string;
  endAt: string;
  label: string;
};

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function PrismaSlotPicker({
  providerId,
  serviceId,
  value,
  onChange,
}: {
  providerId: string;
  serviceId: string;
  value: SelectedPrismaSlot | null;
  onChange: (slot: SelectedPrismaSlot | null) => void;
}) {
  const [date, setDate] = useState("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [slots, setSlots] = useState<SlotOption[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const from = todayIso();
  const to = useMemo(() => addDaysIso(from, DEFAULT_GENERATION_DAYS - 1), [from]);

  useEffect(() => {
    if (!serviceId) {
      setAvailableDates([]);
      return;
    }
    startTransition(async () => {
      const params = new URLSearchParams({
        providerId,
        from,
        to,
        serviceId,
      });
      const res = await fetch(`/api/specialist/slots?${params}`);
      const data = await res.json();
      if (data.ok) {
        setAvailableDates(data.dates ?? []);
        setError(undefined);
      } else {
        setAvailableDates([]);
        setError(data.error);
      }
    });
  }, [providerId, serviceId, from, to]);

  useEffect(() => {
    if (!date || !serviceId) {
      setSlots([]);
      return;
    }
    startTransition(async () => {
      const params = new URLSearchParams({
        providerId,
        date,
        serviceId,
      });
      const res = await fetch(`/api/specialist/slots?${params}`);
      const data = await res.json();
      if (data.ok) {
        setSlots(data.slots ?? []);
        setError(undefined);
      } else {
        setSlots([]);
        setError(data.error);
      }
    });
  }, [date, providerId, serviceId]);

  const dateHasSlots = !date || availableDates.includes(date);

  return (
    <div className="space-y-3">
      {availableDates.length === 0 && !pending && (
        <p className="text-xs text-stone-500">
          Нет доступных дат для записи. Специалист ещё не сгенерировал слоты.
        </p>
      )}

      <div>
        <label className="text-sm font-medium text-stone-700">Дата</label>
        <input
          type="date"
          value={date}
          min={from}
          max={to}
          onChange={(e) => {
            setDate(e.target.value);
            onChange(null);
          }}
          className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
        {date && !dateHasSlots && (
          <p className="mt-1 text-xs text-amber-700">На эту дату нет свободных слотов</p>
        )}
      </div>

      {pending && (
        <p className="text-xs text-stone-500">Загрузка свободных слотов...</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {slots.length > 0 && (
        <div>
          <label className="text-sm font-medium text-stone-700">Время</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() =>
                  onChange({ id: slot.id, startAt: slot.startAt })
                }
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  value?.id === slot.id
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {date && dateHasSlots && !pending && slots.length === 0 && !error && (
        <p className="text-xs text-stone-500">Нет свободных слотов на эту дату</p>
      )}
    </div>
  );
}
