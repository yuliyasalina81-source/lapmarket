"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  deleteAvailabilityRule,
  saveAvailabilityRule,
} from "@/actions/services-supabase";

const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export function AvailabilityEditor({
  rules,
}: {
  rules: Array<{
    id: string;
    weekday: number;
    start_time: string;
    end_time: string;
    break_start: string | null;
    break_end: string | null;
  }>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">График работы</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {rules.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between rounded-xl border border-stone-100 px-3 py-2"
          >
            <span>
              {WEEKDAYS[r.weekday]} {r.start_time.slice(0, 5)}–{r.end_time.slice(0, 5)}
              {r.break_start &&
                ` (перерыв ${r.break_start.slice(0, 5)}–${r.break_end?.slice(0, 5)})`}
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await deleteAvailabilityRule(r.id);
                  if (res.ok) toast.success("Удалено");
                  else toast.error(res.error);
                })
              }
              className="text-red-600 hover:underline"
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 grid gap-2 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const r = await saveAvailabilityRule(new FormData(e.currentTarget));
            if (r.ok) {
              toast.success("Интервал добавлен");
              e.currentTarget.reset();
            } else toast.error(r.error);
          });
        }}
      >
        <select
          name="weekday"
          required
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        >
          {WEEKDAYS.map((label, i) => (
            <option key={label} value={i}>
              {label}
            </option>
          ))}
        </select>
        <input
          name="startTime"
          type="time"
          required
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <input
          name="endTime"
          type="time"
          required
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <input
          name="breakStart"
          type="time"
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <input
          name="breakEnd"
          type="time"
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="sm:col-span-2 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Добавить интервал
        </button>
      </form>
    </section>
  );
}
