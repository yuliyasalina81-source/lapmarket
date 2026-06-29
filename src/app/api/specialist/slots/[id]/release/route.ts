import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isApiError, requireSpecialistApi } from "@/lib/api/require-specialist";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSpecialistApi();
  if (isApiError(authResult)) return authResult;

  const { provider } = authResult;
  const { id } = await params;

  const slot = await prisma.slot.findFirst({
    where: { id, providerId: provider.id },
    select: { id: true, isBooked: true, bookingId: true },
  });

  if (!slot) {
    return NextResponse.json({ ok: false, error: "Слот не найден" }, { status: 404 });
  }
  if (!slot.isBooked) {
    return NextResponse.json({ ok: false, error: "Слот уже свободен" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    if (slot.bookingId) {
      await tx.serviceBooking.update({
        where: { id: slot.bookingId },
        data: { status: "CANCELLED" },
      });
      await tx.slot.updateMany({
        where: { bookingId: slot.bookingId },
        data: { isBooked: false, bookingId: null, bookedBy: null },
      });
      return;
    }

    await tx.slot.update({
      where: { id: slot.id },
      data: { isBooked: false, bookingId: null, bookedBy: null },
    });
  });

  revalidatePath("/dashboard/specialist");
  revalidatePath(`/specialist/${provider.id}`);

  return NextResponse.json({ ok: true });
}
