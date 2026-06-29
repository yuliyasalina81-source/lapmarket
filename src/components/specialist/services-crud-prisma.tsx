"use client";

/** CRUD услуг специалиста через REST API (Prisma) */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SERVICE_CATEGORY_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { ServiceForm } from "@/components/specialist/service-form";
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
  const [createFormKey, setCreateFormKey] = useState(0);

  const refresh = () => router.refresh();

  const saveService = (
    method: "POST" | "PUT" | "DELETE",
    url: string,
    body: Record<string, unknown> | null,
    onSuccess: () => void
  ) => {
    startTransition(async () => {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (data.ok) {
        onSuccess();
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
                <ServiceForm
                  defaultValues={{
                    name: s.name,
                    description: s.description ?? undefined,
                    price: s.price,
                    duration: s.duration,
                    category: s.category,
                  }}
                  submitLabel="Сохранить"
                  pending={pending}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(values) =>
                    saveService("PUT", `/api/specialist/services/${s.id}`, values, () => {
                      toast.success("Сохранено");
                      setEditingId(null);
                    })
                  }
                />
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
                    onClick={() => {
                      if (!confirm("Удалить услугу?")) return;
                      saveService("DELETE", `/api/specialist/services/${s.id}`, null, () =>
                        toast.success("Удалено")
                      );
                    }}
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

      <div className="mt-4">
        <ServiceForm
          key={createFormKey}
          submitLabel="Добавить услугу"
          pending={pending}
          onSubmit={(values) =>
            saveService("POST", "/api/specialist/services", values, () => {
              toast.success("Услуга добавлена");
              setCreateFormKey((k) => k + 1);
            })
          }
        />
      </div>
    </section>
  );
}
