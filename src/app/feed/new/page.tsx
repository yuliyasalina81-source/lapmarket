import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserPets } from "@/lib/queries/pets";
import { PostCreateForm } from "@/components/feed/post-create-form";

export const metadata = { title: "Новый пост — ЛапМаркет" };

export default async function NewPostPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const pets = await getUserPets(session.user.id);

  return (
    <div className="px-4 py-10 sm:px-6">
      <PostCreateForm pets={pets.map((p) => ({ id: p.id, name: p.name }))} />
    </div>
  );
}
