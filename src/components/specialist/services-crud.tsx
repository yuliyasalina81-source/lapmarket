"use client";

/** Client Component */
/** CRUD услуг специалиста */

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteService, upsertService } from "@/actions/services-supabase";
import { formatPrice } from "@/lib/format";

/**
 * Создание, редактирование и удаление услуг
 */
export function ServicesCrud({
  services,
}: {
  services: Array<{
    id: string;
    name: string;
    duration_minutes: number;
    price: number;
    description: string | null;
  }>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Услуги и цены</h2>
      <ul className="mt-3 space-y-2">
        {services.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-xl border border-stone-100 px-3 py-2 text-sm"
          >
            <span>
              {s.name} — {formatPrice(s.price)} · {s.duration_minutes} мин
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const r = await deleteService(s.id);
                  if (r.ok) toast.success("Удалено");
                  else toast.error(r.error);
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
            const r = await upsertService(new FormData(e.currentTarget));
            if (r.ok) {
              toast.success("Услуга добавлена");
              e.currentTarget.reset();
            } else toast.error(r.error);
          });
        }}
      >
        <input
          name="name"
          required
          placeholder="Название"
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <input
          name="price"
          type="number"
          required
          min={0}
          placeholder="Цена ₽"
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <input
          name="durationMinutes"
          type="number"
          required
          min={15}
          step={15}
          placeholder="Минут"
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <input
          name="description"
          placeholder="Описание"
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="sm:col-span-2 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Добавить услугу
        </button>
      </form>
    </section>
  );
}
