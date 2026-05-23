"use client";

import { useState, useTransition } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function PushSettings() {
  const [enabled, setEnabled] = useState(false);
  const [pending, startTransition] = useTransition();
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const subscribe = () => {
    if (!vapidKey) {
      toast.error("Push не настроен на сервере (VAPID keys)");
      return;
    }
    startTransition(async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
        const json = sub.toJSON();
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(json),
        });
        setEnabled(true);
        toast.success("Уведомления включены");
      } catch {
        toast.error("Не удалось подписаться на уведомления");
      }
    });
  };

  const unsubscribe = () => {
    startTransition(async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setEnabled(false);
        toast.success("Уведомления отключены");
      } catch {
        toast.error("Ошибка отписки");
      }
    });
  };

  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return null;
  }

  return (
    <div className="mt-8 rounded-2xl border border-stone-100 bg-white p-5">
      <h2 className="font-semibold text-stone-900">Push-уведомления</h2>
      <p className="mt-1 text-sm text-stone-500">
        Напоминания, заказы и сообщения в браузере
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={enabled ? unsubscribe : subscribe}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium hover:bg-stone-50 disabled:opacity-50"
      >
        {enabled ? (
          <>
            <BellOff className="h-4 w-4" />
            Отключить
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" />
            Включить уведомления
          </>
        )}
      </button>
    </div>
  );
}
