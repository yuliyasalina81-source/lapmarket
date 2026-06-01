"use client";

/** Client Component */
/** Форма заявки на связь с автором объявления */

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { createContactRequest } from "@/actions/animals";

/**
 * Форма «Написать продавцу» для объявления
 */
export function ContactForm({
  listingId,
  listingName,
}: {
  listingId: string;
  listingName: string;
}) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  if (!session?.user) {
    return (
      <p className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
        <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
          Войдите
        </Link>
        , чтобы связаться с продавцом
      </p>
    );
  }

  const submit = () => {
    startTransition(async () => {
      const result = await createContactRequest(listingId, message);
      if (result.ok) {
        toast.success(`Заявка по «${listingName}» отправлена`);
        setMessage("");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="mt-6 space-y-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Ваше сообщение..."
        className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
      />
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Отправка..." : "Связаться"}
      </button>
    </div>
  );
}
