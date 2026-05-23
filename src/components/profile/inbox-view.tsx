"use client";

import Link from "next/link";
import { useTransition } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { updateContactStatus } from "@/actions/animals";
import type { ContactRequestStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

type Thread = {
  id: string;
  message: string;
  status: ContactRequestStatus;
  createdAt: Date;
  role: "seller" | "buyer";
  fromUser: { displayName: string; email: string | null };
  listing: { id: string; name: string };
  lastMessage?: { body: string; createdAt: Date } | null;
};

export function InboxView({ threads }: { threads: Thread[] }) {
  const [pending, startTransition] = useTransition();

  const setStatus = (id: string, status: ContactRequestStatus) => {
    startTransition(async () => {
      const r = await updateContactStatus(id, status);
      if (r.ok) toast.success("Обновлено");
      else toast.error(r.error);
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-900">Сообщения</h1>
      <p className="mt-1 text-sm text-stone-500">
        Переписка по объявлениям о животных
      </p>
      <ul className="mt-8 space-y-4">
        {threads.length === 0 ? (
          <li className="text-stone-500">Нет диалогов</li>
        ) : (
          threads.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-900">
                    {c.listing.name}
                    <span className="ml-2 text-xs font-normal text-stone-400">
                      {c.role === "seller" ? "входящий" : "исходящий"}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {c.role === "seller"
                      ? `От: ${c.fromUser.displayName}`
                      : `Продавец объявления`}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-stone-500">
                    {c.lastMessage?.body ?? c.message}
                  </p>
                  <p className="mt-1 text-xs text-stone-400">
                    {(c.lastMessage?.createdAt ?? c.createdAt).toLocaleString(
                      "ru-RU"
                    )}{" "}
                    · {c.status}
                  </p>
                </div>
                <Link
                  href={`/profile/inbox/${c.id}`}
                  className="flex shrink-0 items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  Чат
                </Link>
              </div>
              {c.role === "seller" && c.status === "NEW" && (
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => setStatus(c.id, "READ")}
                  >
                    Прочитано
                  </Button>
                  <Button
                    type="button"
                    disabled={pending}
                    onClick={() => setStatus(c.id, "CLOSED")}
                  >
                    Закрыть
                  </Button>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
