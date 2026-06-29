"use client";

/** Форма добавления/редактирования услуги специалиста */

import {
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_LABELS,
  SERVICE_DURATIONS,
} from "@/lib/constants";
import type { ServiceCategory } from "@prisma/client";

export type ServiceFormValues = {
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: ServiceCategory;
};

type ServiceFormProps = {
  defaultValues?: Partial<ServiceFormValues>;
  submitLabel: string;
  pending?: boolean;
  onSubmit: (values: ServiceFormValues) => void;
  onCancel?: () => void;
};

export function ServiceForm({
  defaultValues,
  submitLabel,
  pending = false,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  return (
    <form
      className="grid gap-2 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onSubmit({
          name: String(fd.get("name")),
          description: String(fd.get("description") || "") || undefined,
          price: Number(fd.get("price")),
          duration: Number(fd.get("duration")),
          category: fd.get("category") as ServiceCategory,
        });
      }}
    >
      <input
        name="name"
        required
        defaultValue={defaultValues?.name}
        placeholder="Название"
        className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
      />
      <select
        name="category"
        required
        defaultValue={defaultValues?.category ?? "VET"}
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
        defaultValue={defaultValues?.price}
        placeholder="Цена ₽"
        className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
      />
      <select
        name="duration"
        required
        defaultValue={defaultValues?.duration ?? 30}
        className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
      >
        {SERVICE_DURATIONS.map((d) => (
          <option key={d} value={d}>
            {d} мин
          </option>
        ))}
      </select>
      <input
        name="description"
        defaultValue={defaultValues?.description ?? ""}
        placeholder="Описание"
        className="sm:col-span-2 rounded-xl border border-stone-200 px-3 py-2 text-sm"
      />
      <div className={`flex gap-2 ${onCancel ? "sm:col-span-2" : "sm:col-span-2"}`}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Сохранение..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-stone-200 px-4 py-2 text-sm"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}
