import { notFound } from "next/navigation";
import { getPetByShareToken } from "@/lib/queries/pets";

export default async function SharedPetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const pet = await getPetByShareToken(token);
  if (!pet) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <p className="text-sm text-stone-500">Публичный паспорт · только для чтения</p>
      <h1 className="mt-2 text-3xl font-bold text-stone-900">{pet.name}</h1>
      {pet.microchip && (
        <p className="mt-2 text-sm text-stone-600">Чип: {pet.microchip}</p>
      )}
      <h2 className="mt-8 font-semibold text-stone-900">Прививки</h2>
      <ul className="mt-3 space-y-2">
        {pet.vaccinations.length === 0 ? (
          <li className="text-sm text-stone-500">Нет записей</li>
        ) : (
          pet.vaccinations.map((v) => (
            <li key={v.id} className="rounded-xl bg-emerald-50 px-4 py-2 text-sm">
              {v.name} — {v.date.toLocaleDateString("ru-RU")}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
