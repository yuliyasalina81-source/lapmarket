"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { createNotification } from "@/lib/notifications";
import type { BookingStatus } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createServiceBooking(
  providerId: string,
  scheduledAt: string,
  note?: string,
  petId?: string
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const date = new Date(scheduledAt);
    if (isNaN(date.getTime())) {
      return { ok: false, error: "Укажите корректную дату" };
    }

    if (petId) {
      const pet = await prisma.pet.findFirst({
        where: { id: petId, userId: user.id },
      });
      if (!pet) return { ok: false, error: "Питомец не найден" };
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { userId: true, name: true },
    });

    const booking = await prisma.serviceBooking.create({
      data: {
        providerId,
        userId: user.id,
        petId: petId || undefined,
        scheduledAt: date,
        note: note?.trim(),
      },
    });

    if (provider) {
      await createNotification({
        userId: provider.userId,
        type: "BOOKING_UPDATE",
        title: "Новая запись",
        body: `${user.displayName ?? "Клиент"} — ${provider.name}`,
        link: "/profile/provider-bookings",
      });
    }

    revalidatePath("/profile/bookings");
    revalidatePath("/services");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось создать запись" };
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const booking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: { provider: true },
    });
    if (!booking) return { ok: false, error: "Запись не найдена" };

    const isProvider = booking.provider.userId === user.id;
    const isCustomer = booking.userId === user.id;
    if (!isProvider && !isCustomer && user.role !== "ADMIN") {
      return { ok: false, error: "Недостаточно прав" };
    }

    if (isCustomer && !isProvider) {
      if (status !== "CANCELLED" || booking.status !== "NEW") {
        return { ok: false, error: "Можно отменить только новую запись" };
      }
    }

    await prisma.serviceBooking.update({
      where: { id: bookingId },
      data: { status },
    });

    const notifyUserId = isProvider ? booking.userId : booking.provider.userId;
    await createNotification({
      userId: notifyUserId,
      type: "BOOKING_UPDATE",
      title: "Статус записи изменён",
      body: `Запись ${status === "CONFIRMED" ? "подтверждена" : status === "CANCELLED" ? "отменена" : "обновлена"}`,
      link: isProvider ? "/profile/bookings" : "/profile/provider-bookings",
    });

    revalidatePath("/profile/bookings");
    revalidatePath("/profile/provider-bookings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}

export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  return updateBookingStatus(bookingId, "CANCELLED");
}

export async function createServiceReview(
  bookingId: string,
  rating: number,
  text?: string
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const booking = await prisma.serviceBooking.findFirst({
      where: { id: bookingId, userId: user.id, status: "CONFIRMED" },
      include: { provider: true, review: true },
    });
    if (!booking) return { ok: false, error: "Запись не найдена или не завершена" };
    if (booking.review) return { ok: false, error: "Отзыв уже оставлен" };
    if (rating < 1 || rating > 5) return { ok: false, error: "Оценка от 1 до 5" };

    await prisma.serviceReview.create({
      data: {
        bookingId,
        userId: user.id,
        providerId: booking.providerId,
        rating,
        text: text?.trim(),
      },
    });

    const reviews = await prisma.serviceReview.findMany({
      where: { providerId: booking.providerId },
    });
    const avg =
      reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await prisma.serviceProvider.update({
      where: { id: booking.providerId },
      data: { rating: avg, reviewCount: reviews.length },
    });

    revalidatePath("/services");
    revalidatePath(`/services/${booking.providerId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось оставить отзыв" };
  }
}
