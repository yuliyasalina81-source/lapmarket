"use client";

/** CRUD услуг специалиста через REST API (Prisma) */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
} from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { ServiceCategory } from "@prisma/client";

type ServiceItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  category: ServiceCategory;
  isActive: boolean;
};

export function ServicesCrudPrisma({ services }: { services: ServiceItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = () => router.refresh();

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await fetch("/api/specialist/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          description: fd.get("description") || undefined,
          price: fd.get("price"),
          duration: fd.get("duration"),
          category: fd.get("category"),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Услуга добавлена");
        form.reset();
        refresh();
      } else {
        toast.error(data.error ?? "Ошибка");
      }
    });
  };

  const handleUpdate = (id: string, form: HTMLFormElement) => {
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await fetch(`/api/specialist/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          description: fd.get("description") || undefined,
          price: fd.get("price"),
          duration: fd.get("duration"),
          category: fd.get("category"),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Сохранено");
        setEditingId(null);
        refresh();
      } else {
        toast.error(data.error ?? "Ошибка");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Удалить услугу?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/specialist/services/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        toast.success("Удалено");
        refresh();
      } else {
        toast.error(data.error ?? "Ошибка");
      }
    });
  };

  return (
    <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Услуги и цены</h2>

      {services.length === 0 ? (
        <p className="mt-3 text-sm text-stone-500">Добавьте первую услугу</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {services.map((s) =>
            editingId === s.id ? (
              <li key={s.id} className="rounded-xl border border-emerald-200 p-3">
                <form
                  className="grid gap-2 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdate(s.id, e.currentTarget);
                  }}
                >
                  <input
                    name="name"
                    defaultValue={s.name}
                    required
                    className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
                  />
                  <select
                    name="category"
                    defaultValue={s.category}
                    className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
                  >
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {SERVICE_CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                  <input
                    name="price"
                    type="number"
                    min={0}
                    defaultValue={s.price}
                    required
                    className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
                  />
                  <input
                    name="duration"
                    type="number"
                    min={1}
                    defaultValue={s.duration}
                    required
                    className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
                  />
                  <input
                    name="description"
                    defaultValue={s.description ?? ""}
                    placeholder="Описание"
                    className="sm:col-span-2 rounded-xl border border-stone-200 px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2 sm:col-span-2">
                    <button
                      type="submit"
                      disabled={pending}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-xl border border-stone-200 px-4 py-2 text-sm"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </li>
            ) : (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-100 px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">{s.name}</span>
                  <span className="ml-2 text-stone-500">
                    {SERVICE_CATEGORY_LABELS[s.category]} · {formatPrice(s.price)} ·{" "}
                    {s.duration} мин
                  </span>
                  {s.description && (
                    <p className="mt-0.5 text-xs text-stone-500">{s.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setEditingId(s.id)}
                    className="text-emerald-700 hover:underline"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleDelete(s.id)}
                    className="text-red-600 hover:underline"
                  >
                    Удалить
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}

      <form className="mt-4 grid gap-2 sm:grid-cols-2" onSubmit={handleCreate}>
        <input
          name="name"
          required
          placeholder="Название"
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <select
          name="category"
          required
          defaultValue="VET"
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        >
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {SERVICE_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <input
          name="price"
          type="number"
          required
          min={0}
          placeholder="Цена ₽"
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <input
          name="duration"
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
          className="sm:col-span-2 rounded-xl border border-stone-200 px-3 py-2 text-sm"
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
