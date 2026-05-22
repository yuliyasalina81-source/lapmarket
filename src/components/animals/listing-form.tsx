"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createListing } from "@/actions/animals";
import { ImageUpload } from "@/components/ui/image-upload";
import type { AnimalKind, AnimalBadge } from "@prisma/client";
import { ANIMAL_KIND_LABELS } from "@/lib/constants";

const kinds = Object.keys(ANIMAL_KIND_LABELS) as AnimalKind[];

export function ListingForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createListing(formData);
      if (result.ok) {
        toast.success("Объявление отправлено на модерацию");
        router.push("/animals");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">Новое объявление</h1>
      <p className="mt-2 text-sm text-stone-600">
        После создания объявление появится после проверки администратором
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <ImageUpload name="files" multiple maxFiles={6} label="Фото питомца (до 6)" />
        <Field label="Имя" name="name" required />
        <div>
          <label className="text-sm font-medium text-stone-700">Вид</label>
          <select
            name="kind"
            required
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          >
            {kinds.map((k) => (
              <option key={k} value={k}>
                {ANIMAL_KIND_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <Field label="Порода" name="breed" />
        <Field label="Возраст" name="age" required placeholder="3 месяца" />
        <Field label="Город" name="city" required />
        <Field label="Цена (₽)" name="price" type="number" placeholder="Оставьте пустым для «в добрые руки»" />
        <div>
          <label className="text-sm font-medium text-stone-700">Бейджи</label>
          <div className="mt-2 flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="badges" value="PEDIGREE" />
              С паспортом
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="badges" value="GOOD_HANDS" />
              В добрые руки
            </label>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Описание</label>
          <textarea
            name="description"
            required
            rows={4}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "Сохранение..." : "Опубликовать на модерацию"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-stone-700">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400"
      />
    </div>
  );
}
