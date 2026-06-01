/** Server Component */
/** /pets/[id]/edit — редактирование данных питомца */
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPetById } from "@/lib/queries/pets";
import { PetForm } from "@/components/pets/pet-form";

export default async function EditPetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const pet = await getPetById(id, session.user.id);
  if (!pet) notFound();

  return (
    <div className="px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">Редактировать {pet.name}</h1>
      <div className="mt-8">
        <PetForm pet={pet} />
      </div>
    </div>
  );
}
