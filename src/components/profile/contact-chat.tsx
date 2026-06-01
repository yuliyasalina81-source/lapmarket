"use client";

/** Client Component */
/** Чат между пользователями в профиле */

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { toast } from "sonner";
import {
  markContactMessagesRead,
  sendContactMessage,
} from "@/actions/contact-chat";

type Message = {
  id: string;
  body: string;
  createdAt: Date;
  senderId: string;
  sender: { displayName: string; avatar: string };
};

/**
 * Переписка по объявлению или заказу
 */
export function ContactChat({
  contactId,
  listingName,
  otherPartyName,
  currentUserId,
  initialMessages,
}: {
  contactId: string;
  listingName: string;
  otherPartyName: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      await markContactMessagesRead(contactId);
    });
  }, [contactId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [initialMessages.length]);

  const send = () => {
    const body = text.trim();
    if (!body) return;
    startTransition(async () => {
      const result = await sendContactMessage(contactId, body);
      if (result.ok) {
        setText("");
        router.refresh();
      } else toast.error(result.error);
    });
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4 py-6">
      <Link
        href="/profile/inbox"
        className="text-sm text-emerald-700 hover:underline"
      >
        ← Входящие
      </Link>
      <h1 className="mt-2 text-xl font-bold text-stone-900">{listingName}</h1>
      <p className="text-sm text-stone-500">Диалог с {otherPartyName}</p>

      <div className="mt-6 flex max-h-[50vh] min-h-[280px] flex-col gap-3 overflow-y-auto rounded-2xl border border-stone-100 bg-white p-4">
        {initialMessages.length === 0 ? (
          <p className="text-center text-sm text-stone-500">
            Напишите первое сообщение
          </p>
        ) : (
          initialMessages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    mine
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-800"
                  }`}
                >
                  {!mine && (
                    <p className="mb-0.5 text-xs font-semibold opacity-80">
                      {m.sender.displayName}
                    </p>
                  )}
                  <p>{m.body}</p>
                  <p
                    className={`mt-1 text-[10px] ${mine ? "text-emerald-100" : "text-stone-400"}`}
                  >
                    {new Date(m.createdAt).toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Сообщение..."
          className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
        />
        <button
          type="button"
          onClick={send}
          disabled={pending || !text.trim()}
          className="rounded-xl bg-emerald-600 p-2.5 text-white hover:bg-emerald-700 disabled:opacity-50"
          aria-label="Отправить"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
