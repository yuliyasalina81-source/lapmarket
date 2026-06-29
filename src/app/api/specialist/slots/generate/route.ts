/** POST /api/specialist/slots/generate — сгенерировать слоты на 30 дней */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isApiError, requireSpecialistApi } from "@/lib/api/require-specialist";
import {
  DEFAULT_GENERATION_DAYS,
  generateProviderSlots,
} from "@/lib/services/prisma-slots";

export const runtime = "nodejs";

export async function POST() {
  const authResult = await requireSpecialistApi();
  if (isApiError(authResult)) return authResult;

  const { provider } = authResult;

  const stats = await generateProviderSlots(provider.id, DEFAULT_GENERATION_DAYS);

  revalidatePath("/dashboard/specialist");
  revalidatePath(`/specialist/${provider.id}`);

  return NextResponse.json({ ok: true, ...stats });
}
