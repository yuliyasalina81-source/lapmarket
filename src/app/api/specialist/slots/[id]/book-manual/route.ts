import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getAdminNotifyEmail } from "@/lib/env";
import { isApiError, requireSpecialistApi } from "@/lib/api/require-specialist";
import { firstZodError } from "@/lib/validations/service";
import { manualBookSlotSchema } from "@/lib/validations/slot-manual";
import { SLOT_STEP_MINUTES, slotsNeeded } from "@/lib/services/prisma-slots";

export const runtime = "nodejs";

const ADMIN_FALLBACK_EMAIL = "yaroslav937148@gmail.com";

async function sendManualBookingNotify(params: {
  providerName: string;
  specialistName: string;
  clientName: string;
  phone: string;
  when: Date;
  comment?: string;
}) {
  const to = getAdminNotifyEmail() ?? ADMIN_FALLBACK_EMAIL;
  const html = `
    <h2>Ручная запись по телефону</h2>
    <p><b>Специалист:</b> ${params.specialistName} (${params.providerName})</p>
    <p><b>Клиент:</b> ${params.clientName}</p>
    <p><b>Телефон:</b> ${params.phone}</p>
    <p><b>Время:</b> ${params.when.toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })}</p>
    ${params.comment ? `<p><b>Комментарий:</b> ${params.comment}</p>` : ""}
  `;
  void sendEmail({
    to,
    subject: "Запись по телефону — ЛапМаркет",
    html,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSpecialistApi();
  if (isApiError(authResult)) return authResult;

  const { provider, user } = authResult;
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = manualBookSlotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: firstZodError(parsed.error.flatten()) },
      { status: 400 }
    );
  }

  const slot = await prisma.slot.findFirst({
    where: { id, providerId: provider.id },
    select: { id: true, startAt: true, isBooked: true, serviceId: true },
  });
  if (!slot) {
    return NextResponse.json({ ok: false, error: "Слот не найден" }, { status: 404 });
  }
  if (slot.isBooked) {
    return NextResponse.json({ ok: false, error: "Слот уже занят" }, { status: 409 });
  }

  const selectedServiceId = parsed.data.serviceId || slot.serviceId || undefined;
  const service = selectedServiceId
    ? await prisma.service.findFirst({
        where: { id: selectedServiceId, providerId: provider.id, isActive: true },
        select: { id: true, duration: true, name: true },
      })
    : null;

  const needed = slotsNeeded(service?.duration ?? SLOT_STEP_MINUTES);
  const chain: { id: string }[] = [];
  for (let i = 0; i < needed; i++) {
    const expectedStart = new Date(slot.startAt.getTime() + i * SLOT_STEP_MINUTES * 60_000);
    const row = await prisma.slot.findFirst({
      where: {
        providerId: provider.id,
        startAt: expectedStart,
        isBooked: false,
      },
      select: { id: true },
    });
    if (!row) {
      return NextResponse.json(
        { ok: false, error: "Недостаточно свободных слотов для выбранной длительности" },
        { status: 409 }
      );
    }
    chain.push(row);
  }

  const noteParts = [
    `Запись по телефону`,
    `Клиент: ${parsed.data.clientName}`,
    `Телефон: ${parsed.data.phone}`,
  ];
  if (parsed.data.comment) noteParts.push(`Комментарий: ${parsed.data.comment}`);
  const note = noteParts.join("\n");

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.serviceBooking.create({
      data: {
        providerId: provider.id,
        serviceId: service?.id,
        userId: user.id,
        scheduledAt: slot.startAt,
        note,
        status: "CONFIRMED",
      },
    });

    await tx.slot.updateMany({
      where: { id: { in: chain.map((s) => s.id) } },
      data: {
        isBooked: true,
        bookedBy: "MANUAL",
        bookingId: created.id,
        serviceId: service?.id ?? undefined,
      },
    });

    return created;
  });

  await sendManualBookingNotify({
    providerName: provider.name,
    specialistName: user.displayName ?? provider.name,
    clientName: parsed.data.clientName,
    phone: parsed.data.phone,
    when: slot.startAt,
    comment: parsed.data.comment,
  });

  revalidatePath("/dashboard/specialist");
  revalidatePath(`/specialist/${provider.id}`);

  return NextResponse.json({ ok: true, bookingId: booking.id });
}
