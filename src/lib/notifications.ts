import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";
import type { NotificationType } from "@prisma/client";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}) {
  const notification = await prisma.notification.create({ data: params });
  void sendPushToUser(params.userId, {
    title: params.title,
    body: params.body,
    url: params.link,
  });
  return notification;
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

export async function getNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
