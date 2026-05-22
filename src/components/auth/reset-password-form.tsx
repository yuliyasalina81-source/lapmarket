"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resetPassword } from "@/actions/password";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!token || !email) {
    return <p className="mt-4 text-sm text-red-600">Некорректная ссылка сброса.</p>;
  }

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const password = fd.get("password") as string;
        startTransition(async () => {
          const result = await resetPassword(email, token, password);
          if (result.ok) {
            toast.success("Пароль обновлён");
            router.push("/login");
          } else toast.error(result.error);
        });
      }}
    >
      <div>
        <label className="text-sm font-medium text-stone-700">Новый пароль</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Сохранение..." : "Сохранить пароль"}
      </Button>
    </form>
  );
}
