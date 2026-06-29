/**
 * Генерация и фильтрация слотов Prisma по расписанию Availability.
 */
import { prisma } from "@/lib/prisma";
import type { Availability } from "@prisma/client";

export const SLOT_STEP_MINUTES = 30;
export const DEFAULT_GENERATION_DAYS = 30;

export type SlotInterval = {
  startAt: Date;
  endAt: Date;
};

export type SlotRecord = {
  id: string;
  startAt: Date;
  endAt: Date;
  isBooked: boolean;
  bookedBy?: "USER" | "MANUAL" | null;
};

/**
 * Парсит YYYY-MM-DD в начало локального дня.
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Форматирует дату в YYYY-MM-DD (локальное время).
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Количество 30-мин слотов для услуги.
 */
export function slotsNeeded(durationMinutes: number): number {
  return Math.ceil(durationMinutes / SLOT_STEP_MINUTES);
}

/**
 * Возвращает метки времени (ms) занятых 30-мин слотов для записи.
 */
export function occupiedSlotStarts(
  scheduledAt: Date,
  durationMinutes: number
): number[] {
  const count = slotsNeeded(durationMinutes);
  const starts: number[] = [];
  for (let i = 0; i < count; i++) {
    starts.push(scheduledAt.getTime() + i * SLOT_STEP_MINUTES * 60_000);
  }
  return starts;
}

/**
 * Собирает занятые старты слотов и bookingId по записям PENDING/CONFIRMED.
 */
function resolveBookedBy(note: string | null): "USER" | "MANUAL" {
  if (note?.startsWith("Запись по телефону")) return "MANUAL";
  return "USER";
}

export async function getOccupiedSlotsByBookings(
  providerId: string,
  rangeStart: Date,
  rangeEnd: Date
): Promise<Map<number, { bookingId: string; bookedBy: "USER" | "MANUAL" }>> {
  const occupied = new Map<number, { bookingId: string; bookedBy: "USER" | "MANUAL" }>();

  const bookings = await prisma.serviceBooking.findMany({
    where: {
      providerId,
      status: { in: ["PENDING", "CONFIRMED"] },
      scheduledAt: { gte: rangeStart, lt: rangeEnd },
    },
    include: { service: { select: { duration: true } } },
  });

  for (const booking of bookings) {
    const duration = booking.service?.duration ?? SLOT_STEP_MINUTES;
    for (const t of occupiedSlotStarts(booking.scheduledAt, duration)) {
      occupied.set(t, {
        bookingId: booking.id,
        bookedBy: resolveBookedBy(booking.note),
      });
    }
  }

  return occupied;
}

/**
 * Собирает занятые старты слотов по записям PENDING/CONFIRMED и забронированным Slot.
 */
export async function getOccupiedSlotStarts(
  providerId: string,
  rangeStart: Date,
  rangeEnd: Date
): Promise<Set<number>> {
  const occupied = await getOccupiedSlotsByBookings(providerId, rangeStart, rangeEnd);

  const bookedSlots = await prisma.slot.findMany({
    where: {
      providerId,
      isBooked: true,
      startAt: { gte: rangeStart, lt: rangeEnd },
    },
    select: { startAt: true },
  });

  const starts = new Set(occupied.keys());
  for (const slot of bookedSlots) {
    starts.add(slot.startAt.getTime());
  }

  return starts;
}

export type GenerateSlotsResult = {
  created: number;
  recreatedAsBooked: number;
  skippedDueToOccupancy: number;
};

/**
 * Генерирует слоты на N дней вперёд для провайдера.
 * Удаляет существующие слоты в периоде и создаёт новые с учётом записей.
 */
export async function generateProviderSlots(
  providerId: string,
  days: number = DEFAULT_GENERATION_DAYS
): Promise<GenerateSlotsResult> {
  const rules = await prisma.availability.findMany({
    where: { providerId, isActive: true },
  });

  const stats: GenerateSlotsResult = {
    created: 0,
    recreatedAsBooked: 0,
    skippedDueToOccupancy: 0,
  };

  if (rules.length === 0) return stats;

  const rangeStart = new Date();
  rangeStart.setHours(0, 0, 0, 0);

  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + days);

  const occupiedByBooking = await getOccupiedSlotsByBookings(
    providerId,
    rangeStart,
    rangeEnd
  );

  const slotsToCreate: {
    providerId: string;
    startAt: Date;
    endAt: Date;
    isBooked: boolean;
    bookedBy: "USER" | "MANUAL" | null;
    bookingId?: string;
  }[] = [];

  for (let offset = 0; offset < days; offset++) {
    const day = new Date(rangeStart);
    day.setDate(day.getDate() + offset);
    const intervals = generateSlotsForDay(day, rules);

    for (const interval of intervals) {
      if (interval.startAt.getTime() <= Date.now()) continue;

      const startMs = interval.startAt.getTime();
      const occupiedMeta = occupiedByBooking.get(startMs);

      if (occupiedMeta) {
        stats.skippedDueToOccupancy++;
        slotsToCreate.push({
          providerId,
          startAt: interval.startAt,
          endAt: interval.endAt,
          isBooked: true,
          bookingId: occupiedMeta.bookingId,
          bookedBy: occupiedMeta.bookedBy,
        });
      } else {
        slotsToCreate.push({
          providerId,
          startAt: interval.startAt,
          endAt: interval.endAt,
          isBooked: false,
          bookedBy: null,
        });
      }
    }
  }

  stats.created = slotsToCreate.filter((s) => !s.isBooked).length;
  stats.recreatedAsBooked = slotsToCreate.filter((s) => s.isBooked).length;

  await prisma.$transaction(async (tx) => {
    await tx.slot.deleteMany({
      where: {
        providerId,
        startAt: { gte: rangeStart, lt: rangeEnd },
      },
    });

    if (slotsToCreate.length > 0) {
      await tx.slot.createMany({ data: slotsToCreate });
    }
  });

  console.log(
    `[slots/generate] provider=${providerId} period=${rangeStart.toISOString()}..${rangeEnd.toISOString()} created=${stats.created} recreatedAsBooked=${stats.recreatedAsBooked} skippedDueToOccupancy=${stats.skippedDueToOccupancy} total=${slotsToCreate.length}`
  );

  return stats;
}

/**
 * Строит 30-мин интервалы на день по правилам Availability.
 */
export function generateSlotsForDay(
  date: Date,
  rules: Pick<Availability, "dayOfWeek" | "startTime" | "endTime">[]
): SlotInterval[] {
  const weekday = date.getDay();
  const dayRules = rules.filter((r) => r.dayOfWeek === weekday);
  if (dayRules.length === 0) return [];

  const intervals: SlotInterval[] = [];

  for (const rule of dayRules) {
    let cursor = parseTimeToMinutes(rule.startTime);
    const end = parseTimeToMinutes(rule.endTime);

    while (cursor + SLOT_STEP_MINUTES <= end) {
      const startAt = new Date(date);
      startAt.setHours(Math.floor(cursor / 60), cursor % 60, 0, 0);
      const endAt = new Date(startAt);
      endAt.setMinutes(endAt.getMinutes() + SLOT_STEP_MINUTES);
      intervals.push({ startAt, endAt });
      cursor += SLOT_STEP_MINUTES;
    }
  }

  return intervals;
}

/**
 * Оставляет старты, где подряд идут N свободных слотов.
 */
export function filterBookableStarts(
  slots: SlotRecord[],
  durationMinutes: number
): SlotRecord[] {
  const needed = slotsNeeded(durationMinutes);
  if (needed <= 1) {
    return slots.filter((s) => !s.isBooked && s.startAt.getTime() > Date.now());
  }

  const sorted = [...slots].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const byStart = new Map(sorted.map((s) => [s.startAt.getTime(), s]));
  const result: SlotRecord[] = [];

  for (const slot of sorted) {
    if (slot.isBooked || slot.startAt.getTime() <= Date.now()) continue;

    let ok = true;
    for (let i = 0; i < needed; i++) {
      const expectedStart = slot.startAt.getTime() + i * SLOT_STEP_MINUTES * 60_000;
      const candidate = byStart.get(expectedStart);
      if (!candidate || candidate.isBooked) {
        ok = false;
        break;
      }
    }
    if (ok) result.push(slot);
  }

  return result;
}

/**
 * Подпись слота для UI (Europe/Moscow).
 */
export function formatSlotLabel(startAt: Date): string {
  return startAt.toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Границы локального дня для запроса слотов.
 */
export function dayBounds(dateStr: string): { start: Date; end: Date } {
  const start = parseLocalDate(dateStr);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}
