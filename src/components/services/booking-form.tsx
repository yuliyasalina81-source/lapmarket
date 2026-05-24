"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { createAppointment } from "@/actions/services-supabase";
import { createServiceBooking } from "@/actions/services";
import type { CatalogService } from "@/lib/services/catalog-types";
import { SlotPicker } from "./slot-picker";
import { formatPrice } from "@/lib/format";

export function BookingForm({
  specialistId,
  providerName,
  services,
  useSupabase,
  pets = [],
  defaultPetId,
}: {
  specialistId: string;
  providerName: string;
  services: CatalogService[];
  useSupabase: boolean;
  pets?: { id: string; name: string }[];
  defaultPetId?: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [slotIso, setSlotIso] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [note, setNote] = useState("");
  const [petId, setPetId] = useState(defaultPetId ?? pets[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  if (!session?.user) {
    return (
      <p className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm">
        <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
          Войдите
        </Link>
        , чтобы записаться
      </p>
    );
  }

  const submit = () => {
    startTransition(async () => {
      if (useSupabase && serviceId && slotIso) {
        const result = await createAppointment(
          specialistId,
          serviceId,
          slotIso,
          note,
          petId || undefined
        );
        if (result.ok) {
          toast.success(`Запись в «${providerName}» создана`);
          router.push("/dashboard/client");
        } else {
          toast.error(result.error);
        }
        return;
      }

      const result = await createServiceBooking(
        specialistId,
        scheduledAt,
        note,
        petId || undefined
      );
      if (result.ok) {
        toast.success(`Запись в «${providerName}» создана`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="mt-6 space-y-4 border-t border-stone-100 pt-6">
      {useSupabase && services.length > 0 ? (
        <>
          <h2 className="text-lg font-semibold text-stone-900">Услуги</h2>
          <ul className="space-y-2">
            {services.map((s) => (
              <li
                key={s.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm ${
                  serviceId === s.id
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-stone-100"
                }`}
                onClick={() => {
                  setServiceId(s.id);
                  setSlotIso("");
                }}
              >
                <span className="font-medium text-stone-900">{s.name}</span>
                <span className="text-emerald-700">
                  {formatPrice(s.price)} · {s.durationMinutes} мин
                </span>
              </li>
            ))}
          </ul>
          {serviceId && (
            <SlotPicker
              specialistId={specialistId}
              serviceId={serviceId}
              value={slotIso}
              onChange={setSlotIso}
            />
          )}
        </>
      ) : (
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
      )}

      {pets.length > 0 && (
        <div>
          <label className="text-sm font-medium text-stone-700">Питомец</label>
          <select
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          >
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Комментарий к записи"
        className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
      />
      <button
        type="button"
        onClick={submit}
        disabled={
          pending ||
          (useSupabase && services.length > 0 ? !slotIso : !scheduledAt)
        }
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Запись..." : "Записаться"}
      </button>
    </div>
  );
}
