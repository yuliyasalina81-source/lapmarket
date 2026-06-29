import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isApiError, requireSpecialistApi } from "@/lib/api/require-specialist";
import { firstZodError } from "@/lib/validations/service";
import { z } from "zod";

const manageSlotsQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceId: z.string().optional(),
});

export const runtime = "nodejs";

export async function GET(req: Request) {
  const authResult = await requireSpecialistApi();
  if (isApiError(authResult)) return authResult;

  const { provider } = authResult;
  const url = new URL(req.url);
  const parsed = manageSlotsQuerySchema.safeParse({
    from: url.searchParams.get("from"),
    to: url.searchParams.get("to"),
    serviceId: url.searchParams.get("serviceId") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: firstZodError(parsed.error.flatten()) },
      { status: 400 }
    );
  }

  const { from, to, serviceId } = parsed.data;
  const rangeStart = new Date(`${from}T00:00:00`);
  const rangeEnd = new Date(`${to}T00:00:00`);
  rangeEnd.setDate(rangeEnd.getDate() + 1);

  const whereService = serviceId
    ? {
        OR: [{ serviceId }, { serviceId: null }],
      }
    : {};

  const items = await prisma.slot.findMany({
    where: {
      providerId: provider.id,
      startAt: { gte: rangeStart, lt: rangeEnd },
      ...whereService,
    },
    orderBy: { startAt: "asc" },
    include: {
      booking: {
        select: {
          id: true,
          status: true,
          note: true,
        },
      },
      service: { select: { id: true, name: true, duration: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    slots: items.map((slot) => ({
      id: slot.id,
      serviceId: slot.serviceId,
      serviceName: slot.service?.name ?? null,
      startAt: slot.startAt.toISOString(),
      endAt: slot.endAt.toISOString(),
      isBooked: slot.isBooked,
      bookedBy: slot.bookedBy,
      bookingId: slot.bookingId,
      bookingStatus: slot.booking?.status ?? null,
      note: slot.booking?.note ?? null,
      label: slot.startAt.toLocaleTimeString("ru-RU", {
        timeZone: "Europe/Moscow",
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: slot.startAt.toISOString().slice(0, 10),
    })),
  });
}
