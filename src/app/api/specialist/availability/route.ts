/** GET/POST /api/specialist/availability — расписание специалиста */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isApiError, requireSpecialistApi } from "@/lib/api/require-specialist";
import {
  availabilityBulkSchema,
  firstZodError,
  isValidTimeRange,
} from "@/lib/validations/availability";

export const runtime = "nodejs";

export async function GET() {
  const authResult = await requireSpecialistApi();
  if (isApiError(authResult)) return authResult;

  const { provider } = authResult;

  const items = await prisma.availability.findMany({
    where: { providerId: provider.id, isActive: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request) {
  const authResult = await requireSpecialistApi();
  if (isApiError(authResult)) return authResult;

  const { provider } = authResult;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = availabilityBulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: firstZodError(parsed.error.flatten()) },
      { status: 400 }
    );
  }

  for (const item of parsed.data.items) {
    if (!isValidTimeRange(item.startTime, item.endTime)) {
      return NextResponse.json(
        { ok: false, error: "Время окончания должно быть позже начала" },
        { status: 400 }
      );
    }
  }

  const items = await prisma.$transaction(
    parsed.data.items.map((item) =>
      prisma.availability.create({
        data: {
          providerId: provider.id,
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
        },
      })
    )
  );

  revalidatePath("/dashboard/specialist");

  return NextResponse.json({ ok: true, items });
}
