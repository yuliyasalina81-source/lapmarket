/** Server Component */
/** /share/pet/[token] — публичный просмотр паспорта по share-токену */
import { notFound } from "next/navigation";
import { getPetByShareToken } from "@/lib/queries/pets";
import { ProductImage } from "@/components/ui/product-image";

const kindLabels: Record<string, string> = {
  DOG: "Собака",
  CAT: "Кошка",
  BIRD: "Птица",
  RODENT: "Грызун",
  OTHER: "Другое",
};

export default async function SharedPetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const pet = await getPetByShareToken(token);
  if (!pet) notFound();

  const latestWeight = pet.weightLogs[0];

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <p className="text-sm text-stone-500">Публичный паспорт · только для чтения</p>
      {pet.avatarMedia?.url && (
        <div className="relative mt-4 h-40 overflow-hidden rounded-2xl">
          <ProductImage src={pet.avatarMedia.url} alt={pet.name} fill />
        </div>
      )}
      <h1 className="mt-4 text-3xl font-bold text-stone-900">{pet.name}</h1>
      <p className="mt-1 text-stone-600">
        {kindLabels[pet.kind] ?? pet.kind}
        {pet.breed ? ` · ${pet.breed}` : ""}
      </p>
      {pet.birthDate && (
        <p className="mt-2 text-sm text-stone-600">
          Дата рождения: {pet.birthDate.toLocaleDateString("ru-RU")}
        </p>
      )}
      {pet.microchip && (
        <p className="mt-1 text-sm text-stone-600">Чип: {pet.microchip}</p>
      )}
      {latestWeight && (
        <p className="mt-2 text-sm font-medium text-emerald-700">
          Текущий вес: {latestWeight.kg} кг (
          {latestWeight.date.toLocaleDateString("ru-RU")})
        </p>
      )}
      <h2 className="mt-8 font-semibold text-stone-900">Прививки</h2>
      <ul className="mt-3 space-y-2">
        {pet.vaccinations.length === 0 ? (
          <li className="text-sm text-stone-500">Нет записей</li>
        ) : (
          pet.vaccinations.map((v) => (
            <li key={v.id} className="rounded-xl bg-emerald-50 px-4 py-2 text-sm">
              {v.name} — {v.date.toLocaleDateString("ru-RU")}
              {v.clinic && ` · ${v.clinic}`}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
