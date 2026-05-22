"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateContactStatus } from "@/actions/animals";
import type { ContactRequestStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

export function InboxView({
  contacts,
}: {
  contacts: {
    id: string;
    message: string;
    status: ContactRequestStatus;
    createdAt: Date;
    fromUser: { displayName: string; email: string | null };
    listing: { id: string; name: string };
  }[];
}) {
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
      <h1 className="text-2xl font-bold text-stone-900">Входящие запросы</h1>
      <ul className="mt-8 space-y-4">
        {contacts.length === 0 ? (
          <li className="text-stone-500">Нет сообщений</li>
        ) : (
          contacts.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-stone-100 bg-white p-4 shadow-sm"
            >
              <p className="font-medium text-stone-900">
                {c.listing.name} — {c.fromUser.displayName}
              </p>
              <p className="mt-1 text-sm text-stone-600">{c.message}</p>
              <p className="mt-1 text-xs text-stone-400">
                {c.createdAt.toLocaleString("ru-RU")} · {c.status}
              </p>
              {c.status === "NEW" && (
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
