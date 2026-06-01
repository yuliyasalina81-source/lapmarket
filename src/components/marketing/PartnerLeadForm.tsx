"use client";

/** Client Component */
/** Заявка партнёра с лендинга для бизнеса */

import { useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Форма заявки на подключение к платформе
 */
export function PartnerLeadForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch("/api/partner-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          clinicName: fd.get("clinicName"),
          phone: fd.get("phone"),
          email: fd.get("email"),
          city: fd.get("city"),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Не удалось отправить заявку");
        return;
      }
      setDone(true);
      form.reset();
    } catch {
      setError("Ошибка сети. Попробуйте позже.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-emerald-50 px-5 py-6 text-center text-emerald-800">
        <p className="font-semibold">
          Заявка отправлена. Мы свяжемся с вами в течение 24 часов.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-4 text-sm font-medium text-emerald-700 underline"
        >
          Отправить ещё одну
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="partner-name" className="mb-1.5 block text-sm font-medium text-stone-700">
          Имя
        </label>
        <input
          id="partner-name"
          name="name"
          required
          className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      <div>
        <label
          htmlFor="partner-clinic"
          className="mb-1.5 block text-sm font-medium text-stone-700"
        >
          Название клиники / салона
        </label>
        <input
          id="partner-clinic"
          name="clinicName"
          required
          className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="partner-phone" className="mb-1.5 block text-sm font-medium text-stone-700">
            Телефон
          </label>
          <input
            id="partner-phone"
            name="phone"
            type="tel"
            required
            className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div>
          <label htmlFor="partner-email" className="mb-1.5 block text-sm font-medium text-stone-700">
            Email
          </label>
          <input
            id="partner-email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>
      <div>
        <label htmlFor="partner-city" className="mb-1.5 block text-sm font-medium text-stone-700">
          Город
        </label>
        <input
          id="partner-city"
          name="city"
          required
          placeholder="Москва"
          className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Отправка...
          </>
        ) : (
          "Отправить заявку"
        )}
      </button>
      <p className="text-center text-sm text-stone-500">
        Мы свяжемся с вами в течение 24 часов
      </p>
    </form>
  );
}
