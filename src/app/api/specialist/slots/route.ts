/** GET /api/specialist/slots — свободные слоты или даты с слотами */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  dayBounds,
  filterBookableStarts,
  formatLocalDate,
  formatSlotLabel,
  parseLocalDate,
} from "@/lib/services/prisma-slots";
import { firstZodError, slotsQuerySchema } from "@/lib/validations/availability";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = slotsQuerySchema.safeParse({
    providerId: url.searchParams.get("providerId"),
    date: url.searchParams.get("date") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    serviceId: url.searchParams.get("serviceId") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: firstZodError(parsed.error.flatten()) },
      { status: 400 }
    );
  }

  const { providerId, date, from, to, serviceId } = parsed.data;

  const provider = await prisma.serviceProvider.findUnique({
    where: { id: providerId },
    select: { id: true },
  });
  if (!provider) {
    return NextResponse.json({ ok: false, error: "Специалист не найден" }, { status: 404 });
  }

  let durationMinutes: number | undefined;
  if (serviceId) {
    const service = await prisma.service.findFirst({
      where: { id: serviceId, providerId, isActive: true },
      select: { duration: true },
    });
    if (!service) {
      return NextResponse.json({ ok: false, error: "Услуга не найдена" }, { status: 404 });
    }
    durationMinutes = service.duration;
  }

  if (date) {
    const { start, end } = dayBounds(date);
    const rawSlots = await prisma.slot.findMany({
      where: {
        providerId,
        startAt: { gte: start, lt: end },
        isBooked: false,
      },
      orderBy: { startAt: "asc" },
      select: { id: true, startAt: true, endAt: true, isBooked: true },
    });

    const bookable = durationMinutes
      ? filterBookableStarts(rawSlots, durationMinutes)
      : rawSlots.filter((s) => s.startAt.getTime() > Date.now());

    return NextResponse.json({
      ok: true,
      slots: bookable.map((s) => ({
        id: s.id,
        startAt: s.startAt.toISOString(),
        endAt: s.endAt.toISOString(),
        label: formatSlotLabel(s.startAt),
      })),
    });
  }

  if (from && to) {
    const rangeStart = parseLocalDate(from);
    const rangeEnd = parseLocalDate(to);
    rangeEnd.setDate(rangeEnd.getDate() + 1);

    const rawSlots = await prisma.slot.findMany({
      where: {
        providerId,
        startAt: { gte: rangeStart, lt: rangeEnd },
        isBooked: false,
      },
      orderBy: { startAt: "asc" },
      select: { id: true, startAt: true, endAt: true, isBooked: true },
    });

    const datesSet = new Set<string>();
    const days: Date[] = [];
    const cursor = parseLocalDate(from);
    const last = parseLocalDate(to);
    while (cursor <= last) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const day of days) {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const daySlots = rawSlots.filter(
        (s) => s.startAt >= dayStart && s.startAt < dayEnd
      );
      const bookable = durationMinutes
        ? filterBookableStarts(daySlots, durationMinutes)
        : daySlots.filter((s) => s.startAt.getTime() > Date.now());

      if (bookable.length > 0) {
        datesSet.add(formatLocalDate(dayStart));
      }
    }

    return NextResponse.json({
      ok: true,
      dates: Array.from(datesSet).sort(),
    });
  }

  return NextResponse.json(
    { ok: false, error: "Укажите date или from и to" },
    { status: 400 }
  );
}
