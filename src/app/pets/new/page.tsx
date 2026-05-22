import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PetForm } from "@/components/pets/pet-form";

export const metadata = { title: "Новый питомец — ЛапМаркет" };

export default async function NewPetPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/pets/new");

  return (
    <div className="px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">Новый питомец</h1>
      <div className="mt-8">
        <PetForm />
      </div>
    </div>
  );
}
