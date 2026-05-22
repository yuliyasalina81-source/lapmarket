"use server";

import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sendEmail } from "@/lib/email";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  try {
    const normalized = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user?.email) return { ok: true };

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.deleteMany({
      where: { identifier: normalized },
    });
    await prisma.verificationToken.create({
      data: { identifier: normalized, token, expires },
    });

    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    const link = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(normalized)}`;

    await sendEmail({
      to: normalized,
      subject: "Сброс пароля — ЛапМаркет",
      html: `<p>Здравствуйте!</p><p><a href="${link}">Сбросить пароль</a></p><p>Ссылка действует 1 час.</p>`,
    });

    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось отправить письмо" };
  }
}

export async function resetPassword(
  email: string,
  token: string,
  newPassword: string
): Promise<ActionResult> {
  try {
    const normalized = email.trim().toLowerCase();
    const record = await prisma.verificationToken.findFirst({
      where: { identifier: normalized, token },
    });
    if (!record || record.expires < new Date()) {
      return { ok: false, error: "Ссылка недействительна или истекла" };
    }
    if (newPassword.length < 8) {
      return { ok: false, error: "Пароль не менее 8 символов" };
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { email: normalized },
      data: { passwordHash },
    });
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalized },
    });

    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось сменить пароль" };
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ActionResult> {
  try {
    const { requireSessionUser } = await import("@/lib/session");
    const session = await requireSessionUser();
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user?.passwordHash) return { ok: false, error: "Пользователь не найден" };

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) return { ok: false, error: "Неверный текущий пароль" };
    if (newPassword.length < 8) {
      return { ok: false, error: "Новый пароль не менее 8 символов" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка смены пароля" };
  }
}
