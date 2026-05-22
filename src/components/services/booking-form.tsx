"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { createServiceBooking } from "@/actions/services";

export function BookingForm({
  providerId,
  providerName,
  pets = [],
  defaultPetId,
}: {
  providerId: string;
  providerName: string;
  pets?: { id: string; name: string }[];
  defaultPetId?: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
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
      const result = await createServiceBooking(
        providerId,
        scheduledAt,
        note,
        petId || undefined
      );
      if (result.ok) {
        toast.success(`Запись в «${providerName}» создана`);
        setScheduledAt("");
        setNote("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="mt-6 space-y-3 border-t border-stone-100 pt-6">
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
      <input
        type="datetime-local"
        value={scheduledAt}
        onChange={(e) => setScheduledAt(e.target.value)}
        className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
      />
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
        disabled={pending || !scheduledAt}
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Запись..." : "Записаться"}
      </button>
    </div>
  );
}
