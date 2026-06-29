"use client";

/** Редактор расписания специалиста (Prisma REST API) */

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const WEEKDAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

type AvailabilityItem = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export function AvailabilityEditorPrisma() {
  const router = useRouter();
  const [items, setItems] = useState<AvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/specialist/availability");
    const data = await res.json();
    if (data.ok) {
      setItems(data.items);
    } else {
      toast.error(data.error ?? "Не удалось загрузить расписание");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = () => {
    router.refresh();
    load();
  };

  return (
    <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">График работы</h2>

      {loading ? (
        <p className="mt-3 text-sm text-stone-500">Загрузка...</p>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">
          Расписание не задано. Добавьте рабочие дни и сгенерируйте слоты.
        </p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-stone-100 px-3 py-2"
            >
              <span>
                {WEEKDAYS[r.dayOfWeek]} {r.startTime.slice(0, 5)}–{r.endTime.slice(0, 5)}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await fetch(`/api/specialist/availability/${r.id}`, {
                      method: "DELETE",
                    });
                    const data = await res.json();
                    if (data.ok) {
                      toast.success("Удалено");
                      refresh();
                    } else {
                      toast.error(data.error ?? "Ошибка");
                    }
                  })
                }
                className="text-red-600 hover:underline disabled:opacity-50"
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        ref={formRef}
        className="mt-4 grid gap-2 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const dayOfWeek = Number(fd.get("dayOfWeek"));
          const startTime = String(fd.get("startTime")).slice(0, 5);
          const endTime = String(fd.get("endTime")).slice(0, 5);

          startTransition(async () => {
            const res = await fetch("/api/specialist/availability", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: [{ dayOfWeek, startTime, endTime }],
              }),
            });
            const data = await res.json();
            if (data.ok) {
              toast.success("День добавлен");
              formRef.current?.reset();
              refresh();
            } else {
              toast.error(data.error ?? "Ошибка");
            }
          });
        }}
      >
        <select
          name="dayOfWeek"
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
        <button
          type="submit"
          disabled={pending}
          className="sm:col-span-3 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Добавить день
        </button>
      </form>

      <button
        type="button"
        disabled={pending || items.length === 0}
        onClick={() =>
          startTransition(async () => {
            const res = await fetch("/api/specialist/slots/generate", { method: "POST" });
            const data = await res.json();
            if (data.ok) {
              const parts = [`Создано слотов: ${data.created}`];
              if (data.skippedDueToOccupancy > 0) {
                parts.push(`пропущено из-за записей: ${data.skippedDueToOccupancy}`);
              }
              toast.success(parts.join(", "));
              refresh();
            } else {
              toast.error(data.error ?? "Ошибка генерации");
            }
          })
        }
        className="mt-4 w-full rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
      >
        Сгенерировать слоты на месяц
      </button>
    </section>
  );
}
