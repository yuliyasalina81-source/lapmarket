"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setSpecialistVerification } from "@/actions/services-supabase";
import type { VerificationStatus } from "@/lib/supabase/database.types";

export function SupabaseSpecialistsPanel({
  specialists,
}: {
  specialists: Array<{
    id: string;
    user_id: string;
    kind: string;
    address: string;
    license_url: string | null;
    verification_status: string;
    profile?: {
      full_name: string;
      city: string | null;
    };
  }>;
}) {
  const [filter, setFilter] = useState<string>("pending");
  const [pending, startTransition] = useTransition();

  const filtered = specialists.filter(
    (s) => !filter || s.verification_status === filter
  );

  const setStatus = (id: string, status: VerificationStatus) => {
    startTransition(async () => {
      const r = await setSpecialistVerification(id, status);
      if (r.ok) toast.success(status === "approved" ? "Одобрено" : "Отклонено");
      else toast.error(r.error);
    });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", ""] as const).map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              filter === s
                ? "bg-emerald-600 text-white"
                : "bg-stone-100 text-stone-600"
            }`}
          >
            {s === "" ? "Все" : s === "pending" ? "На проверке" : s === "approved" ? "Одобрены" : "Отклонены"}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-stone-500">Нет заявок</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((sp) => (
            <li
              key={sp.id}
              className="rounded-2xl border border-stone-100 bg-white p-4"
            >
              <p className="font-medium text-stone-900">
                {sp.profile?.full_name ?? sp.user_id}
              </p>
              <p className="text-sm text-stone-500">
                {sp.kind === "vet" ? "Ветеринар" : "Грумер"} · {sp.profile?.city} ·{" "}
                {sp.address}
              </p>
              <p className="text-xs text-stone-500">{sp.verification_status}</p>
              {sp.license_url && (
                <a
                  href={sp.license_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-emerald-700 hover:underline"
                >
                  Открыть лицензию
                </a>
              )}
              {sp.verification_status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setStatus(sp.id, "approved")}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Одобрить
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setStatus(sp.id, "rejected")}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-50"
                  >
                    Отклонить
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
