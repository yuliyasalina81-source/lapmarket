/** Server Component */
/** /feed — лента постов владельцев питомцев */
import { auth } from "@/lib/auth";
import { getFeedPosts } from "@/lib/queries/posts";
import { getUserPets } from "@/lib/queries/pets";
import { FeedView } from "@/components/feed/feed-view";

export const metadata = {
  title: "Лента — ЛапМаркет",
};

export default async function FeedPage() {
  const session = await auth();
  const [posts, pets] = await Promise.all([
    getFeedPosts(),
    session?.user?.id ? getUserPets(session.user.id) : Promise.resolve([]),
  ]);

  return (
    <FeedView
      posts={posts}
      currentUserId={session?.user?.id}
      pets={pets.map((p) => ({ id: p.id, name: p.name }))}
    />
  );
}
