"use client";

/** Секция удаления аккаунта с подтверждением */

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";

export function DeleteAccountSection({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const close = () => {
    setOpen(false);
    setPassword("");
    setConfirmed(false);
    formRef.current?.reset();
  };

  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirmed) {
      toast.error("Подтвердите, что понимаете последствия");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.ok) {
        close();
        toast.success("Аккаунт успешно удалён");
        await signOut({ redirect: false });
        router.push("/");
        router.refresh();
      } else {
        toast.error(data.error ?? "Не удалось удалить аккаунт");
      }
    });
  };

  return (
    <>
      <section className="mt-12 border-t border-stone-200 pt-8">
        <h2 className="text-lg font-semibold text-stone-900">Удалить аккаунт</h2>
        <p className="mt-2 text-sm text-stone-600">
          Все ваши данные — питомцы, записи, посты и заказы — будут удалены безвозвратно.
        </p>
        {hasPassword ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            Удалить аккаунт
          </button>
        ) : (
          <p className="mt-4 text-sm text-amber-800">
            Удаление доступно только для аккаунтов с паролем (вход по email).
          </p>
        )}
      </section>

      <Modal open={open} onClose={close} title="Удалить аккаунт" size="sm">
        <form ref={formRef} onSubmit={handleDelete} className="space-y-4">
          <p className="text-sm text-stone-600">
            Вы уверены, что хотите удалить аккаунт? Это действие необратимо.
          </p>

          <div>
            <label className="text-sm font-medium text-stone-700">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5"
            />
            <span>Я понимаю, что все данные будут удалены</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              disabled={pending}
              className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={pending || !password || !confirmed}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {pending ? "Удаление..." : "Удалить аккаунт"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
