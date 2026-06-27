/**
 * Авторизация REST API для кабинета специалиста.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureServiceProviderForUser } from "@/lib/specialist-prisma";

export type SpecialistApiContext = {
  user: { id: string; role: string; displayName?: string | null; email?: string | null };
  provider: NonNullable<Awaited<ReturnType<typeof ensureServiceProviderForUser>>>;
};

/**
 * Проверяет сессию SPECIALIST/ADMIN и возвращает провайдера.
 * @returns SpecialistApiContext или NextResponse с ошибкой
 */
export async function requireSpecialistApi(): Promise<
  SpecialistApiContext | NextResponse
> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Необходима авторизация" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "SPECIALIST" && role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Недостаточно прав" }, { status: 403 });
  }

  const provider = await ensureServiceProviderForUser(session.user.id);
  if (!provider) {
    return NextResponse.json({ ok: false, error: "Профиль специалиста не найден" }, { status: 404 });
  }

  return { user: session.user, provider };
}

export function isApiError(
  result: SpecialistApiContext | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
