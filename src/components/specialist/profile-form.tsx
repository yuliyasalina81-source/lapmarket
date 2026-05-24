"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateSpecialistProfile } from "@/actions/services-supabase";

export function ProfileForm({
  defaultValues,
}: {
  defaultValues: {
    fullName: string;
    city: string;
    address: string;
    about: string;
    phone: string;
  };
}) {
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">Профиль</h2>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const r = await updateSpecialistProfile(fd);
            if (r.ok) toast.success("Сохранено");
            else toast.error(r.error);
          });
        }}
      >
        <input
          name="fullName"
          defaultValue={defaultValues.fullName}
          placeholder="Имя / название клиники"
          className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
        <input
          name="city"
          defaultValue={defaultValues.city}
          placeholder="Город"
          className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
        <input
          name="address"
          defaultValue={defaultValues.address}
          required
          placeholder="Адрес"
          className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
        <input
          name="phone"
          defaultValue={defaultValues.phone}
          placeholder="Телефон"
          className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
        <textarea
          name="about"
          defaultValue={defaultValues.about}
          rows={3}
          placeholder="О себе"
          className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </section>
  );
}
