"use client";

import { useEffect, useState, useTransition } from "react";
import { getAvailableSlots } from "@/actions/services-supabase";

export function SlotPicker({
  specialistId,
  serviceId,
  value,
  onChange,
}: {
  specialistId: string;
  serviceId: string;
  value: string;
  onChange: (iso: string) => void;
}) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<{ iso: string; label: string }[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!date || !serviceId) {
      setSlots([]);
      return;
    }
    startTransition(async () => {
      const result = await getAvailableSlots(
        specialistId,
        serviceId,
        new Date(date).toISOString()
      );
      if (result.ok) {
        setSlots(result.slots);
        setError(undefined);
      } else {
        setSlots([]);
        setError(result.error);
      }
    });
  }, [date, specialistId, serviceId]);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-stone-700">Дата</label>
        <input
          type="date"
          value={date}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => {
            setDate(e.target.value);
            onChange("");
          }}
          className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
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
                key={slot.iso}
                type="button"
                onClick={() => onChange(slot.iso)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  value === slot.iso
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
      {date && !pending && slots.length === 0 && !error && (
        <p className="text-xs text-stone-500">Нет свободных слотов на эту дату</p>
      )}
    </div>
  );
}
