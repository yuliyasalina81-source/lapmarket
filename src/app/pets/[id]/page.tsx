import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPetById } from "@/lib/queries/pets";
import { PetPassport } from "@/components/pets/pet-passport";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `Питомец — ЛапМаркет` };
}

export default async function PetDetailPage({
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PetPassport pet={pet} />
    </div>
  );
}
