"use client";

/** Client Component */
/** Виджет чата поддержки на лендинге */

import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";

/**
 * Плавающая кнопка и окно чата с поддержкой
 */
export function ContactChatWidget() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);

  function handleClose() {
    setOpen(false);
    if (done) {
      setDone(false);
      setError(undefined);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setPending(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = (fd.get("email") as string)?.trim();
    const phone = (fd.get("phone") as string)?.trim();

    if (!email && !phone) {
      setError("Укажите email или телефон");
      setPending(false);
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "chat",
          name: fd.get("name"),
          email: email || undefined,
          phone: phone || undefined,
          message: fd.get("message"),
          company: fd.get("company"),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Не удалось отправить");
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-2xl text-white shadow-lg shadow-emerald-900/25 transition hover:scale-105 active:scale-95 md:bottom-6"
        aria-label="Написать нам"
      >
        <MessageCircle className="h-7 w-7" aria-hidden />
      </button>

      <Modal open={open} onClose={handleClose} title="Связаться с нами" size="sm">
        {done ? (
          <p className="py-4 text-center text-sm text-stone-600">
            Спасибо, мы свяжемся с вами как можно скорее
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot — скрыто от людей, боты часто заполняют */}
            <div
              className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
              aria-hidden
            >
              <label htmlFor="chat-company">Компания</label>
              <input
                id="chat-company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="chat-name" className="mb-1.5 block text-sm font-medium text-stone-700">
                Имя
              </label>
              <input
                id="chat-name"
                name="name"
                required
                autoComplete="name"
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-base outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 md:text-sm"
              />
            </div>
            <div>
              <label htmlFor="chat-email" className="mb-1.5 block text-sm font-medium text-stone-700">
                Email
              </label>
              <input
                id="chat-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-base outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 md:text-sm"
              />
            </div>
            <div>
              <label htmlFor="chat-phone" className="mb-1.5 block text-sm font-medium text-stone-700">
                Телефон
              </label>
              <input
                id="chat-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-base outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 md:text-sm"
              />
            </div>
            <p className="text-xs text-stone-500">Укажите email или телефон</p>
            <div>
              <label htmlFor="chat-message" className="mb-1.5 block text-sm font-medium text-stone-700">
                Сообщение
              </label>
              <textarea
                id="chat-message"
                name="message"
                rows={4}
                className="w-full resize-y rounded-xl border border-stone-200 px-4 py-2.5 text-base outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 md:text-sm"
              />
            </div>
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Отправка...
                </>
              ) : (
                "Отправить"
              )}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
