"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SERVICE_KIND_LABELS } from "@/lib/constants";
import { ServiceCard } from "./service-card";
import { Modal } from "@/components/ui/modal";
import { createServiceBooking } from "@/actions/services";
import type { ServiceProviderWithMedia } from "@/lib/queries/services";
import type { ServiceKind } from "@prisma/client";

export function ServicesView({
  providers,
  isLoggedIn,
}: {
  providers: ServiceProviderWithMedia[];
  isLoggedIn: boolean;
}) {
  const [kindFilter, setKindFilter] = useState<ServiceKind | "ALL">("ALL");
  const [bookProvider, setBookProvider] = useState<ServiceProviderWithMedia | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered =
    kindFilter === "ALL"
      ? providers
      : providers.filter((p) => p.kind === kindFilter);

  const submitBooking = () => {
    if (!bookProvider) return;
    if (!isLoggedIn) {
      toast.error("Войдите, чтобы записаться");
      return;
    }
    startTransition(async () => {
      const result = await createServiceBooking(
        bookProvider.id,
        scheduledAt,
        note
      );
      if (result.ok) {
        toast.success("Запись создана");
        setBookProvider(null);
        setScheduledAt("");
        setNote("");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Ветеринары и грумеры
      </h1>
      <p className="mt-2 text-stone-600">
        Запись онлайн, проверенные специалисты с отзывами
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <FilterPill active={kindFilter === "ALL"} onClick={() => setKindFilter("ALL")} label="Все" />
        {(Object.keys(SERVICE_KIND_LABELS) as ServiceKind[]).map((k) => (
          <FilterPill
            key={k}
            active={kindFilter === k}
            onClick={() => setKindFilter(k)}
            label={SERVICE_KIND_LABELS[k]}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-5">
        {filtered.length === 0 ? (
          <p className="text-center text-stone-500">Услуг в этой категории пока нет</p>
        ) : (
          filtered.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={(s) => {
                if (!isLoggedIn) {
                  toast.error("Войдите, чтобы записаться");
                  return;
                }
                setBookProvider(s);
              }}
            />
          ))
        )}
      </div>

      <Modal
        open={!!bookProvider}
        onClose={() => setBookProvider(null)}
        title={`Запись: ${bookProvider?.name ?? ""}`}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-700">Дата и время</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Комментарий</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={submitBooking}
            disabled={pending || !scheduledAt}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {pending ? "Запись..." : "Подтвердить запись"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium ${
        active ? "bg-emerald-600 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"
      }`}
    >
      {label}
    </button>
  );
}
