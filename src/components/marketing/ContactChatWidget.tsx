"use client";

import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";

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

    const fd = new FormData(e.currentTarget);
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
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Не удалось отправить");
        return;
      }
      setDone(true);
      e.currentTarget.reset();
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
            Спасибо, мы ответим вам в ближайшее время
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="chat-name" className="mb-1.5 block text-sm font-medium text-stone-700">
                Имя
              </label>
              <input
                id="chat-name"
                name="name"
                required
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
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
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
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
                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
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
                className="w-full resize-y rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
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
