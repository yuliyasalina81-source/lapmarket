"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const user = await requireSessionUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export async function approveCertification(
  requestId: string,
  adminNote?: string
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const request = await prisma.sellerCertificationRequest.findUnique({
      where: { id: requestId },
      include: { sellerProfile: true },
    });
    if (!request) return { ok: false, error: "Заявка не найдена" };

    await prisma.$transaction([
      prisma.sellerCertificationRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          adminNote: adminNote?.trim(),
          resolvedAt: new Date(),
        },
      }),
      prisma.sellerProfile.update({
        where: { id: request.sellerProfileId },
        data: { tier: "CERTIFIED", verifiedAt: new Date() },
      }),
    ]);

    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}

export async function rejectCertification(
  requestId: string,
  adminNote?: string
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.sellerCertificationRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        adminNote: adminNote?.trim(),
        resolvedAt: new Date(),
      },
    });
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}
