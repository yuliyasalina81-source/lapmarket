import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserPosts } from "@/lib/queries/posts";
import { PostCard } from "@/components/feed/post-card";
import { AvatarDisplay } from "@/components/ui/avatar-display";
import { auth } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { displayName: true },
  });
  return { title: user ? `${user.displayName} — ЛапМаркет` : "Профиль" };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      avatar: true,
      city: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) notFound();

  const posts = await getUserPosts(id);
  const pets =
    session?.user?.id === id
      ? await prisma.pet.findMany({
          where: { userId: id },
          select: { id: true, name: true },
        })
      : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link href="/feed" className="text-sm text-emerald-700 hover:underline">
        ← Лента
      </Link>
      <div className="mt-6 flex items-center gap-4">
        <AvatarDisplay avatar={user.avatar} name={user.displayName} size={72} />
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{user.displayName}</h1>
          {user.city && <p className="text-stone-500">{user.city}</p>}
          <p className="text-sm text-stone-400">{posts.length} постов</p>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-5">
        {posts.length === 0 ? (
          <p className="text-stone-500">Постов пока нет</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={session?.user?.id}
              pets={pets}
            />
          ))
        )}
      </div>
    </div>
  );
}
