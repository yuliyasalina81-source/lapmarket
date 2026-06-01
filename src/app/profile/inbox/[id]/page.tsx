/** Server Component */
/** /profile/inbox/[id] — переписка в одном диалоге */
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContactChat } from "@/components/profile/contact-chat";

export const metadata = { title: "Диалог — ЛапМаркет" };

export default async function InboxThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const contact = await prisma.contactRequest.findUnique({
    where: { id },
    include: {
      listing: { select: { name: true, authorId: true } },
      fromUser: { select: { id: true, displayName: true, avatar: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { displayName: true, avatar: true } },
        },
      },
    },
  });

  if (!contact) notFound();

  const isBuyer = contact.fromUserId === session.user.id;
  const isSeller = contact.listing.authorId === session.user.id;
  if (!isBuyer && !isSeller) notFound();

  const seller = await prisma.user.findUnique({
    where: { id: contact.listing.authorId },
    select: { displayName: true },
  });

  const otherPartyName = isBuyer
    ? (seller?.displayName ?? "Продавец")
    : contact.fromUser.displayName;

  const allMessages = [
    {
      id: "initial",
      body: contact.message,
      createdAt: contact.createdAt,
      senderId: contact.fromUserId,
      sender: contact.fromUser,
    },
    ...contact.messages,
  ];

  return (
    <ContactChat
      contactId={contact.id}
      listingName={contact.listing.name}
      otherPartyName={otherPartyName}
      currentUserId={session.user.id}
      initialMessages={allMessages}
    />
  );
}
