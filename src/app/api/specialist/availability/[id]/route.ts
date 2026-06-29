/** DELETE /api/specialist/availability/[id] — удалить день расписания */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isApiError, requireSpecialistApi } from "@/lib/api/require-specialist";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSpecialistApi();
  if (isApiError(authResult)) return authResult;

  const { provider } = authResult;
  const { id } = await params;

  const existing = await prisma.availability.findFirst({
    where: { id, providerId: provider.id },
  });

  if (!existing) {
    return NextResponse.json({ ok: false, error: "Запись не найдена" }, { status: 404 });
  }

  await prisma.availability.delete({ where: { id } });

  revalidatePath("/dashboard/specialist");

  return NextResponse.json({ ok: true });
}
