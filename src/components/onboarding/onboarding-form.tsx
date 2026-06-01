"use client";

/** Client Component */
/** Онбординг после первого входа */

import { useTransition } from "react";
import { toast } from "sonner";
import { completeOnboarding } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm";

/**
 * Мастер заполнения профиля нового пользователя
 */
export function OnboardingForm() {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-8 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await completeOnboarding(new FormData(e.currentTarget));
          if (!result.ok) toast.error(result.error);
        });
      }}
    >
      <fieldset className="space-y-3 rounded-2xl border border-stone-100 p-4">
        <legend className="px-2 text-sm font-semibold text-stone-800">1. Питомец</legend>
        <input name="name" required placeholder="Имя" className={inputClass} />
        <select name="kind" defaultValue="DOG" className={inputClass}>
          <option value="DOG">Собака</option>
          <option value="CAT">Кошка</option>
          <option value="OTHER">Другое</option>
        </select>
      </fieldset>
      <fieldset className="space-y-3 rounded-2xl border border-stone-100 p-4">
        <legend className="px-2 text-sm font-semibold text-stone-800">2. Прививка (опционально)</legend>
        <input name="vaccName" placeholder="Название" className={inputClass} />
        <input name="vaccDate" type="date" className={inputClass} />
      </fieldset>
      <fieldset className="space-y-3 rounded-2xl border border-stone-100 p-4">
        <legend className="px-2 text-sm font-semibold text-stone-800">3. Напоминание (опционально)</legend>
        <input name="reminderTitle" placeholder="Например: повторная прививка" className={inputClass} />
        <input name="reminderDue" type="datetime-local" className={inputClass} />
      </fieldset>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Сохранение..." : "Готово"}
      </Button>
    </form>
  );
}
