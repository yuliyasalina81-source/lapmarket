"use client";

import { useTransition } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { updateProfile, updateAvatar } from "@/actions/settings";
import { AvatarDisplay } from "@/components/ui/avatar-display";
import { PushSettings } from "@/components/pwa/push-settings";
import type { UserRole } from "@prisma/client";

export function SettingsForm({
  user,
}: {
  user: {
    displayName: string;
    city: string;
    avatar: string;
    role: UserRole;
    pets: string;
  };
}) {
  const { update: updateSession } = useSession();
  const [pending, startTransition] = useTransition();

  const saveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.ok) toast.success("Профиль сохранён");
      else toast.error(result.error);
    });
  };

  const saveAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const result = await updateAvatar(formData);
      if (result.ok) {
        toast.success("Аватар обновлён");
        await updateSession();
      } else toast.error(result.error);
    });
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">Настройки</h1>

      <div className="mt-8 flex items-center gap-4">
        <AvatarDisplay avatar={user.avatar} name={user.displayName} size={80} />
        <label className="cursor-pointer rounded-xl border border-stone-200 px-4 py-2 text-sm font-medium hover:bg-stone-50">
          Сменить фото
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={saveAvatar}
            disabled={pending}
          />
        </label>
      </div>

      <form onSubmit={saveProfile} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-stone-700">Имя</label>
          <input
            name="displayName"
            defaultValue={user.displayName}
            required
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Город</label>
          <input
            name="city"
            defaultValue={user.city}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          />
        </div>
        {user.role === "OWNER" && (
          <p className="text-sm text-stone-600">
            <a href="/pets" className="font-semibold text-emerald-700 hover:underline">
              Управлять питомцами в паспорте →
            </a>
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
      <PushSettings />
    </div>
  );
}
