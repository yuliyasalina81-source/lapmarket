import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, PawPrint } from "lucide-react";
import { auth } from "@/lib/auth";
import { getUserPets } from "@/lib/queries/pets";
import { PetCard } from "@/components/pets/pet-card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Мои питомцы — ЛапМаркет" };

export default async function PetsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/pets");

  const pets = await getUserPets(session.user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Паспорт питомца</h1>
          <p className="mt-2 text-stone-600">
            Прививки, напоминания, вес и медкарта
          </p>
        </div>
        <Link
          href="/pets/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Добавить питомца
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon={PawPrint}
            title="Пока нет питомцев"
            description="Создайте цифровой паспорт — добавьте прививки и напоминания."
            actionLabel="Добавить питомца"
            actionHref="/pets/new"
          />
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <li key={pet.id}>
              <PetCard pet={pet} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
