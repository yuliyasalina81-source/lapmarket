/** POST /api/user/delete — удаление аккаунта пользователя */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { deleteAccountSchema } from "@/lib/validations/user";
import { firstZodError } from "@/lib/validations/service";

export const runtime = "nodejs";

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 15 * 60 * 1000;

async function deleteUserData(userId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.comment.deleteMany({ where: { authorId: userId } });
    await tx.postLike.deleteMany({ where: { userId } });
    await tx.post.deleteMany({ where: { authorId: userId } });
    await tx.serviceBooking.deleteMany({ where: { userId } });
    await tx.notification.deleteMany({ where: { userId } });
    await tx.orderRequest.deleteMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    });
    await tx.pet.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Необходима авторизация" }, { status: 401 });
  }

  const ip = getClientIp(req);
  const rateKey = `delete-account:${ip}:${session.user.id}`;
  const rate = checkRateLimit(rateKey, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: `Слишком много попыток. Повторите через ${rate.retryAfterSec} с.` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: firstZodError(parsed.error.flatten()) },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    return NextResponse.json({ ok: false, error: "Пользователь не найден" }, { status: 404 });
  }

  if (!user.passwordHash) {
    return NextResponse.json(
      { ok: false, error: "У аккаунта нет пароля. Войдите через email и пароль." },
      { status: 400 }
    );
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Неверный пароль" }, { status: 403 });
  }

  try {
    await deleteUserData(user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Не удалось удалить аккаунт" },
      { status: 500 }
    );
  }
}
