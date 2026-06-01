"use client";

/** Client Component */
/** Колокольчик уведомлений в шапке */

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/actions/notifications";
import type { NotificationType } from "@prisma/client";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
};

/**
 * Выпадающий список уведомлений с счётчиком
 */
export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = (id: string, link: string | null) => {
    startTransition(async () => {
      await markNotificationRead(id);
      if (link) window.location.href = link;
    });
    setOpen(false);
  };

  const markAll = () => {
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-xl p-2 text-stone-500 transition hover:bg-stone-100 hover:text-emerald-700"
        aria-label="Уведомления"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-stone-50 px-4 py-3">
              <p className="text-sm font-semibold text-stone-900">Уведомления</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAll}
                  disabled={pending}
                  className="text-xs font-medium text-emerald-600 hover:underline"
                >
                  Прочитать все
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-stone-500">
                  Пока нет уведомлений
                </li>
              ) : (
                notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => markRead(n.id, n.link)}
                      className={`w-full px-4 py-3 text-left transition hover:bg-emerald-50 ${
                        !n.readAt ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      <p className="text-sm font-medium text-stone-900">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-stone-600">{n.body}</p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
