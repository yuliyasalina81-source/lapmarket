"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { getPetAiTips } from "@/actions/pet-ai";

export function PetAiTips({ petId }: { petId: string }) {
  const [tips, setTips] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      const result = await getPetAiTips(petId);
      if (result.ok) setTips(result.tips);
      else setTips(result.error);
    });
  };

  return (
    <section className="mt-6 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-emerald-50/50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-900">
            <Sparkles className="h-5 w-5 text-violet-600" />
            Советы по уходу
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Персональные рекомендации на основе паспорта питомца
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={pending}
          className="shrink-0 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Получить"
          )}
        </button>
      </div>
      {tips && (
        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
          {tips}
        </div>
      )}
    </section>
  );
}
