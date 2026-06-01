/** Server Component */
/** Карточка питомца в списке */

import Link from "next/link";
import { PawPrint, Calendar } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import type { AnimalKind } from "@prisma/client";

const kindLabels: Record<AnimalKind, string> = {
  DOG: "Собака",
  CAT: "Кошка",
  BIRD: "Птица",
  RODENT: "Грызун",
  OTHER: "Другое",
};

/**
 * Краткая карточка питомца со ссылкой на паспорт
 */
export function PetCard({
  pet,
}: {
  pet: {
    id: string;
    name: string;
    kind: AnimalKind;
    breed: string | null;
    avatarMedia?: { url: string } | null;
    reminders: { title: string; dueAt: Date }[];
  };
}) {
  const nextReminder = pet.reminders[0];
  return (
    <Link
      href={`/pets/${pet.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-36 bg-gradient-to-br from-emerald-50 to-violet-50">
        {pet.avatarMedia?.url ? (
          <ProductImage src={pet.avatarMedia.url} alt={pet.name} fill />
        ) : (
          <span className="flex h-full items-center justify-center text-5xl opacity-40">
            <PawPrint className="h-16 w-16 text-emerald-400" />
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-stone-900 group-hover:text-emerald-800">
          {pet.name}
        </h3>
        <p className="text-sm text-stone-500">
          {kindLabels[pet.kind]}
          {pet.breed ? ` · ${pet.breed}` : ""}
        </p>
        {nextReminder && (
          <p className="mt-2 flex items-center gap-1 text-xs text-amber-700">
            <Calendar className="h-3.5 w-3.5" />
            {nextReminder.title} —{" "}
            {new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(
              nextReminder.dueAt
            )}
          </p>
        )}
      </div>
    </Link>
  );
}
