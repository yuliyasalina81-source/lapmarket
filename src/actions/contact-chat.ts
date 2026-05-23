"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { createNotification } from "@/lib/notifications";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function canAccessContact(contactId: string, userId: string) {
  const contact = await prisma.contactRequest.findUnique({
    where: { id: contactId },
    include: { listing: { select: { authorId: true, name: true } } },
  });
  if (!contact) return null;
  const isBuyer = contact.fromUserId === userId;
  const isSeller = contact.listing.authorId === userId;
  if (!isBuyer && !isSeller) return null;
  return { contact, isBuyer, isSeller };
}

export async function sendContactMessage(
  contactRequestId: string,
  body: string
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const text = body.trim();
    if (!text) return { ok: false, error: "Введите сообщение" };

    const access = await canAccessContact(contactRequestId, user.id);
    if (!access) return { ok: false, error: "Нет доступа" };

    await prisma.contactMessage.create({
      data: {
        contactRequestId,
        senderId: user.id,
        body: text,
      },
    });

    if (access.contact.status === "NEW") {
      await prisma.contactRequest.update({
        where: { id: contactRequestId },
        data: { status: "READ" },
      });
    }

    const notifyUserId = access.isBuyer
      ? access.contact.listing.authorId
      : access.contact.fromUserId;

    if (notifyUserId !== user.id) {
      await createNotification({
        userId: notifyUserId,
        type: "CONTACT_REQUEST",
        title: "Новое сообщение",
        body: `${user.displayName}: ${text.slice(0, 80)}`,
        link: `/profile/inbox/${contactRequestId}`,
      });
    }

    revalidatePath(`/profile/inbox/${contactRequestId}`);
    revalidatePath("/profile/inbox");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось отправить" };
  }
}

export async function markContactMessagesRead(
  contactRequestId: string
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const access = await canAccessContact(contactRequestId, user.id);
    if (!access) return { ok: false, error: "Нет доступа" };

    await prisma.contactMessage.updateMany({
      where: {
        contactRequestId,
        senderId: { not: user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    revalidatePath(`/profile/inbox/${contactRequestId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}
