/**
 * In-app уведомления в БД и параллельная отправка Web Push.
 */
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";
import type { NotificationType } from "@prisma/client";

/**
 * Создаёт уведомление и запускает push (без ожидания).
 * @param params userId, type, title, body, link
 * @returns Созданная запись Notification
 */
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

/**
 * Считает непрочитанные уведомления пользователя.
 * @param userId Идентификатор пользователя
 * @returns Количество с readAt === null
 */
export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

/**
 * Список последних уведомлений пользователя.
 * @param userId Идентификатор пользователя
 * @param limit Максимум записей (по умолчанию 20)
 * @returns Массив Notification
 */
export async function getNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
