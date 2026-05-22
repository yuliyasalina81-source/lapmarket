import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InboxView } from "@/components/profile/inbox-view";

export const metadata = { title: "Входящие — ЛапМаркет" };

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const contacts = await prisma.contactRequest.findMany({
    where: { listing: { authorId: session.user.id } },
    include: {
      fromUser: { select: { displayName: true, email: true } },
      listing: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <InboxView contacts={contacts} />;
}
