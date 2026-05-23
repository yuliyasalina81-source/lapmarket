import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InboxView } from "@/components/profile/inbox-view";

export const metadata = { title: "Входящие — ЛапМаркет" };

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [asSeller, asBuyer] = await Promise.all([
    prisma.contactRequest.findMany({
      where: { listing: { authorId: userId } },
      include: {
        fromUser: { select: { displayName: true, email: true } },
        listing: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { body: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactRequest.findMany({
      where: { fromUserId: userId },
      include: {
        fromUser: { select: { displayName: true, email: true } },
        listing: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { body: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const threads = [
    ...asSeller.map((c) => ({
      id: c.id,
      message: c.message,
      status: c.status,
      createdAt: c.createdAt,
      role: "seller" as const,
      fromUser: c.fromUser,
      listing: c.listing,
      lastMessage: c.messages[0] ?? null,
    })),
    ...asBuyer.map((c) => ({
      id: c.id,
      message: c.message,
      status: c.status,
      createdAt: c.createdAt,
      role: "buyer" as const,
      fromUser: c.fromUser,
      listing: c.listing,
      lastMessage: c.messages[0] ?? null,
    })),
  ].sort(
    (a, b) =>
      new Date(b.lastMessage?.createdAt ?? b.createdAt).getTime() -
      new Date(a.lastMessage?.createdAt ?? a.createdAt).getTime()
  );

  return <InboxView threads={threads} />;
}
