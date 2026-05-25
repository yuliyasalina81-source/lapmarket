"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SERVICE_KIND_LABELS } from "@/lib/constants";
import { serviceKindToSpecialistKind } from "@/lib/services/catalog-types";
import type { CatalogSpecialist } from "@/lib/services/catalog-types";
import type { ServiceKind } from "@prisma/client";
import { createAppointment } from "@/actions/services-supabase";
import { createServiceBooking } from "@/actions/services";
import { ServiceCard } from "./service-card";
import { ServicesMap } from "./services-map";
import { Modal } from "@/components/ui/modal";
import { SlotPicker } from "./slot-picker";
import { PromoBanner } from "@/components/marketing/PromoBanner";

export function ServicesView({
  providers,
  isLoggedIn,
  pets = [],
  useSupabase = false,
}: {
  providers: CatalogSpecialist[];
  isLoggedIn: boolean;
  pets?: { id: string; name: string }[];
  useSupabase?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kindParam = searchParams.get("kind");
  const cityParam = searchParams.get("city") ?? "";
  const priceMaxParam = searchParams.get("priceMax");

  const kindFilter: ServiceKind | "ALL" =
    kindParam && kindParam in SERVICE_KIND_LABELS
      ? (kindParam as ServiceKind)
      : "ALL";

  const [cityInput, setCityInput] = useState(cityParam);
  const [priceMaxInput, setPriceMaxInput] = useState(priceMaxParam ?? "");
  const [bookProvider, setBookProvider] = useState<CatalogSpecialist | null>(null);
  const [serviceId, setServiceId] = useState("");
  const [slotIso, setSlotIso] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [note, setNote] = useState("");
  const [petId, setPetId] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let list = providers;
    if (kindFilter !== "ALL") {
      list = list.filter((p) => p.kind === kindFilter);
    }
    if (cityParam.trim()) {
      const c = cityParam.trim().toLowerCase();
      list = list.filter((p) => p.city.toLowerCase().includes(c));
    }
    if (priceMaxParam) {
      const max = Number(priceMaxParam);
      if (!isNaN(max)) list = list.filter((p) => p.priceFrom <= max);
    }
    return list;
  }, [providers, kindFilter, cityParam, priceMaxParam]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (kindFilter !== "ALL") params.set("kind", kindFilter);
    if (cityInput.trim()) params.set("city", cityInput.trim());
    if (priceMaxInput.trim()) params.set("priceMax", priceMaxInput.trim());
    router.replace(`/services?${params.toString()}`);
  };

  const setKind = (kind: ServiceKind | "ALL") => {
    const params = new URLSearchParams(searchParams.toString());
    if (kind === "ALL") params.delete("kind");
    else params.set("kind", kind);
    router.replace(`/services?${params.toString()}`);
  };

  const submitBooking = () => {
    if (!bookProvider) return;
    if (!isLoggedIn) {
      toast.error("Войдите, чтобы записаться");
      return;
    }

    startTransition(async () => {
      if (useSupabase && serviceId && slotIso) {
        const result = await createAppointment(
          bookProvider.id,
          serviceId,
          slotIso,
          note,
          petId || undefined
        );
        if (result.ok) {
          toast.success("Запись создана");
          setBookProvider(null);
          setServiceId("");
          setSlotIso("");
          setNote("");
        } else {
          toast.error(result.error);
        }
        return;
      }

      const result = await createServiceBooking(
        bookProvider.id,
        scheduledAt,
        note,
        petId || undefined
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

  const hasSupabaseServices =
    useSupabase && bookProvider && bookProvider.services.length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-stone-900">
        Ветеринары и грумеры
      </h1>
      <p className="mt-2 text-stone-600">
        Запись онлайн, проверенные специалисты с отзывами
      </p>

      <PromoBanner className="mt-6" />

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-stone-100 bg-white p-4">
        <div>
          <label className="text-xs font-medium text-stone-600">Город</label>
          <input
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Москва"
            className="mt-1 block w-36 rounded-xl border border-stone-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-stone-600">Цена до, ₽</label>
          <input
            type="number"
            value={priceMaxInput}
            onChange={(e) => setPriceMaxInput(e.target.value)}
            className="mt-1 block w-28 rounded-xl border border-stone-200 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Применить
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterPill active={kindFilter === "ALL"} onClick={() => setKind("ALL")} label="Все" />
        {(Object.keys(SERVICE_KIND_LABELS) as ServiceKind[])
          .filter((k) => !useSupabase || serviceKindToSpecialistKind(k))
          .map((k) => (
            <FilterPill
              key={k}
              active={kindFilter === k}
              onClick={() => setKind(k)}
              label={SERVICE_KIND_LABELS[k]}
            />
          ))}
      </div>

      <ServicesMap providers={filtered} />

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
                setServiceId(s.services[0]?.id ?? "");
                setSlotIso("");
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
          {pets.length > 0 && (
            <div>
              <label className="text-sm font-medium text-stone-700">Питомец</label>
              <select
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
              >
                <option value="">Не выбран</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasSupabaseServices ? (
            <>
              <div>
                <label className="text-sm font-medium text-stone-700">Услуга</label>
                <select
                  value={serviceId}
                  onChange={(e) => {
                    setServiceId(e.target.value);
                    setSlotIso("");
                  }}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
                >
                  {bookProvider!.services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.price} ₽ ({s.durationMinutes} мин)
                    </option>
                  ))}
                </select>
              </div>
              {serviceId && (
                <SlotPicker
                  specialistId={bookProvider!.id}
                  serviceId={serviceId}
                  value={slotIso}
                  onChange={setSlotIso}
                />
              )}
            </>
          ) : (
            <div>
              <label className="text-sm font-medium text-stone-700">Дата и время</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
              />
            </div>
          )}

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
            disabled={
              pending ||
              (hasSupabaseServices ? !slotIso : !scheduledAt)
            }
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
