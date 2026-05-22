"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPet, updatePet } from "@/actions/pets";
import { ImageUpload } from "@/components/ui/image-upload";
import { Button } from "@/components/ui/button";
import type { AnimalKind, PetSex } from "@prisma/client";

const kinds: { value: AnimalKind; label: string }[] = [
  { value: "DOG", label: "Собака" },
  { value: "CAT", label: "Кошка" },
  { value: "BIRD", label: "Птица" },
  { value: "RODENT", label: "Грызун" },
  { value: "OTHER", label: "Другое" },
];

export function PetForm({
  pet,
}: {
  pet?: {
    id: string;
    name: string;
    kind: AnimalKind;
    breed: string | null;
    sex: PetSex | null;
    birthDate: Date | null;
    weightKg: number | null;
    microchip: string | null;
    notes: string | null;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = !!pet;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = isEdit
        ? await updatePet(pet.id, formData)
        : await createPet(formData);
      if (result.ok) {
        toast.success(isEdit ? "Сохранено" : "Питомец добавлен");
        router.push(result.id ? `/pets/${result.id}` : "/pets");
        router.refresh();
      } else toast.error(result.error);
    });
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-4">
      <ImageUpload name="file" label="Фото питомца" />
      <div>
        <label className="text-sm font-medium text-stone-700">Имя *</label>
        <input
          name="name"
          defaultValue={pet?.name}
          required
          className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-stone-700">Вид</label>
        <select
          name="kind"
          defaultValue={pet?.kind ?? "DOG"}
          className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        >
          {kinds.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-stone-700">Порода</label>
          <input
            name="breed"
            defaultValue={pet?.breed ?? ""}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Пол</label>
          <select
            name="sex"
            defaultValue={pet?.sex ?? ""}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          >
            <option value="">Не указан</option>
            <option value="MALE">Мальчик</option>
            <option value="FEMALE">Девочка</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-stone-700">Дата рождения</label>
          <input
            name="birthDate"
            type="date"
            defaultValue={
              pet?.birthDate
                ? pet.birthDate.toISOString().slice(0, 10)
                : undefined
            }
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Вес (кг)</label>
          <input
            name="weightKg"
            type="number"
            step="0.1"
            min="0"
            defaultValue={pet?.weightKg ?? ""}
            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-stone-700">Чип</label>
        <input
          name="microchip"
          defaultValue={pet?.microchip ?? ""}
          className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-stone-700">Заметки</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={pet?.notes ?? ""}
          className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить питомца"}
      </Button>
    </form>
  );
}
