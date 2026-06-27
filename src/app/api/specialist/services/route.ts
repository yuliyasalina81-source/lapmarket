/** POST /api/specialist/services — создать услугу */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isApiError, requireSpecialistApi } from "@/lib/api/require-specialist";
import { createServiceSchema, firstZodError } from "@/lib/validations/service";

export const runtime = "nodejs";

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

  const parsed = createServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: firstZodError(parsed.error.flatten()) },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const service = await prisma.service.create({
    data: {
      providerId: provider.id,
      name: data.name,
      description: data.description || null,
      price: data.price,
      duration: data.duration,
      category: data.category,
    },
  });

  revalidatePath("/dashboard/specialist");
  revalidatePath(`/specialist/${provider.id}`);
  revalidatePath(`/services/${provider.id}`);

  return NextResponse.json({ ok: true, service });
}
