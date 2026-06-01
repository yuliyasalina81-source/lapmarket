"use client";

/** Client Component */
/** Форма запроса ссылки для сброса пароля */

import { useTransition } from "react";
import { toast } from "sonner";
import { requestPasswordReset } from "@/actions/password";
import { Button } from "@/components/ui/button";

/**
 * Форма «Забыли пароль?» с отправкой email
 */
export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const email = new FormData(e.currentTarget).get("email") as string;
        startTransition(async () => {
          const result = await requestPasswordReset(email);
          if (result.ok) toast.success("Если email зарегистрирован, письмо отправлено");
          else toast.error(result.error);
        });
      }}
    >
      <div>
        <label className="text-sm font-medium text-stone-700">Email</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Отправка..." : "Отправить ссылку"}
      </Button>
    </form>
  );
}
