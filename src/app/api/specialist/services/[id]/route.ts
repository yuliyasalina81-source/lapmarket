/** PUT/DELETE /api/specialist/services/[id] */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isApiError, requireSpecialistApi } from "@/lib/api/require-specialist";
import { firstZodError, updateServiceSchema } from "@/lib/validations/service";

export const runtime = "nodejs";

async function getOwnedService(id: string, providerId: string) {
  return prisma.service.findFirst({
    where: { id, providerId },
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSpecialistApi();
  if (isApiError(authResult)) return authResult;

  const { provider } = authResult;
  const { id } = await params;

  const existing = await getOwnedService(id, provider.id);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Услуга не найдена" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = updateServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: firstZodError(parsed.error.flatten()) },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined
        ? { description: data.description || null }
        : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.duration !== undefined ? { duration: data.duration } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });

  revalidatePath("/dashboard/specialist");
  revalidatePath(`/specialist/${provider.id}`);
  revalidatePath(`/services/${provider.id}`);

  return NextResponse.json({ ok: true, service });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSpecialistApi();
  if (isApiError(authResult)) return authResult;

  const { provider } = authResult;
  const { id } = await params;

  const existing = await getOwnedService(id, provider.id);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Услуга не найдена" }, { status: 404 });
  }

  const pendingCount = await prisma.serviceBooking.count({
    where: { serviceId: id, status: "PENDING" },
  });
  if (pendingCount > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: "Нельзя удалить услугу с активными ожидающими записями",
      },
      { status: 409 }
    );
  }

  await prisma.service.delete({ where: { id } });

  revalidatePath("/dashboard/specialist");
  revalidatePath(`/specialist/${provider.id}`);
  revalidatePath(`/services/${provider.id}`);

  return NextResponse.json({ ok: true });
}
