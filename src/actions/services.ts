/** Server Actions для записей на услуги (Prisma) */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { notifyBookingEvent } from "@/lib/booking-notifications";
import { SLOT_STEP_MINUTES, slotsNeeded } from "@/lib/services/prisma-slots";
import type { BookingStatus, Prisma } from "@prisma/client";

export type ActionResult = { ok: true } | { ok: false; error: string };

type Tx = Prisma.TransactionClient;

async function findConsecutiveFreeSlots(
  tx: Tx,
  providerId: string,
  firstSlot: { id: string; startAt: Date },
  count: number
) {
  const slots = [firstSlot];
  for (let i = 1; i < count; i++) {
    const expectedStart = new Date(
      firstSlot.startAt.getTime() + i * SLOT_STEP_MINUTES * 60_000
    );
    const slot = await tx.slot.findFirst({
      where: { providerId, startAt: expectedStart, isBooked: false },
      select: { id: true, startAt: true },
    });
    if (!slot) return null;
    slots.push(slot);
  }
  return slots;
}

/**
 * Создаёт запись на услугу к провайдеру (Prisma ServiceBooking).
 */
export async function createServiceBooking(
  providerId: string,
  serviceId: string,
  scheduledAt: string,
  note?: string,
  petId?: string,
  slotId?: string
): Promise<ActionResult> {
  console.log("[booking] API called");
  try {
    const user = await requireSessionUser();
    const date = new Date(scheduledAt);
    if (isNaN(date.getTime())) {
      return { ok: false, error: "Укажите корректную дату" };
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, providerId, isActive: true },
    });
    if (!service) {
      return { ok: false, error: "Услуга не найдена или недоступна" };
    }

    if (petId) {
      const pet = await prisma.pet.findFirst({
        where: { id: petId, userId: user.id },
      });
      if (!pet) return { ok: false, error: "Питомец не найден" };
    }

    const needed = slotsNeeded(service.duration);

    const booking = await prisma.$transaction(async (tx) => {
      let firstSlot: { id: string; startAt: Date } | null = null;

      if (slotId) {
        firstSlot = await tx.slot.findFirst({
          where: { id: slotId, providerId, isBooked: false },
          select: { id: true, startAt: true },
        });
      } else {
        firstSlot = await tx.slot.findFirst({
          where: { providerId, startAt: date, isBooked: false },
          select: { id: true, startAt: true },
        });
      }

      if (slotId && !firstSlot) {
        throw new Error("SLOT_UNAVAILABLE");
      }

      if (firstSlot) {
        const chain = await findConsecutiveFreeSlots(tx, providerId, firstSlot, needed);
        if (!chain) {
          if (slotId) throw new Error("SLOT_UNAVAILABLE");
        } else {
          const created = await tx.serviceBooking.create({
            data: {
              providerId,
              serviceId,
              userId: user.id,
              petId: petId || undefined,
              scheduledAt: firstSlot.startAt,
              note: note?.trim(),
              status: "PENDING",
            },
          });

          await tx.slot.updateMany({
            where: { id: { in: chain.map((s) => s.id) } },
            data: { isBooked: true, bookingId: created.id, bookedBy: "USER" },
          });

          return created;
        }
      }

      return tx.serviceBooking.create({
        data: {
          providerId,
          serviceId,
          userId: user.id,
          petId: petId || undefined,
          scheduledAt: date,
          note: note?.trim(),
          status: "PENDING",
        },
      });
    });

    console.log("[booking] created", booking.id);

    await notifyBookingEvent("CREATED", booking.id);

    revalidatePath("/profile/bookings");
    revalidatePath("/dashboard/client");
    revalidatePath("/services");
    revalidatePath(`/specialist/${providerId}`);
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "SLOT_UNAVAILABLE") {
      return { ok: false, error: "Выбранное время уже занято" };
    }
    return { ok: false, error: "Не удалось создать запись" };
  }
}

/**
 * Меняет статус записи.
 */
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
      if (status !== "CANCELLED" || booking.status !== "PENDING") {
        return { ok: false, error: "Можно отменить только ожидающую запись" };
      }
    }

    if (isProvider && status === "COMPLETED" && booking.status !== "CONFIRMED") {
      return { ok: false, error: "Завершить можно только подтверждённую запись" };
    }

    if (isProvider && status === "CONFIRMED" && booking.status !== "PENDING") {
      return { ok: false, error: "Подтвердить можно только ожидающую запись" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.serviceBooking.update({
        where: { id: bookingId },
        data: { status },
      });

      if (status === "CANCELLED") {
        await tx.slot.updateMany({
          where: { bookingId },
          data: { isBooked: false, bookingId: null, bookedBy: null },
        });
      }
    });

    if (status === "CONFIRMED") {
      await notifyBookingEvent("CONFIRMED", bookingId);
    } else if (status === "CANCELLED") {
      await notifyBookingEvent("CANCELLED", bookingId, {
        cancelledByCustomer: isCustomer && !isProvider,
      });
    } else if (status === "COMPLETED") {
      await notifyBookingEvent("COMPLETED", bookingId);
    }

    revalidatePath("/profile/bookings");
    revalidatePath("/profile/provider-bookings");
    revalidatePath("/dashboard/specialist");
    revalidatePath("/dashboard/client");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}

/**
 * Отменяет запись (обёртка над updateBookingStatus).
 */
export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  return updateBookingStatus(bookingId, "CANCELLED");
}

/**
 * Создаёт отзыв после завершённой записи и обновляет рейтинг провайдера.
 */
export async function createServiceReview(
  bookingId: string,
  rating: number,
  text?: string
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const booking = await prisma.serviceBooking.findFirst({
      where: { id: bookingId, userId: user.id, status: "COMPLETED" },
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
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await prisma.serviceProvider.update({
      where: { id: booking.providerId },
      data: { rating: avg, reviewCount: reviews.length },
    });

    revalidatePath("/services");
    revalidatePath(`/services/${booking.providerId}`);
    revalidatePath(`/specialist/${booking.providerId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось оставить отзыв" };
  }
}
