"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { deletePost } from "@/actions/posts";
import type { ProductStatus, UserRole } from "@prisma/client";

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

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.user.update({ where: { id: userId }, data: { role } });
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}

export async function updateProductStatusAdmin(
  productId: string,
  status: ProductStatus
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.product.update({ where: { id: productId }, data: { status } });
    revalidatePath("/admin");
    revalidatePath("/market");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}

export async function adminDeletePost(postId: string): Promise<ActionResult> {
  return deletePost(postId, true);
}

export async function deleteProductReview(reviewId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
    });
    if (!review) return { ok: false, error: "Не найдено" };

    await prisma.productReview.delete({ where: { id: reviewId } });
    const reviews = await prisma.productReview.findMany({
      where: { productId: review.productId },
    });
    const avg =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;
    await prisma.product.update({
      where: { id: review.productId },
      data: { rating: avg, reviewCount: reviews.length },
    });

    revalidatePath("/admin");
    revalidatePath(`/market/${review.productId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}

export async function deleteServiceReview(reviewId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const review = await prisma.serviceReview.findUnique({
      where: { id: reviewId },
    });
    if (!review) return { ok: false, error: "Не найдено" };

    await prisma.serviceReview.delete({ where: { id: reviewId } });
    const reviews = await prisma.serviceReview.findMany({
      where: { providerId: review.providerId },
    });
    const avg =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;
    await prisma.serviceProvider.update({
      where: { id: review.providerId },
      data: { rating: avg, reviewCount: reviews.length },
    });

    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}

export async function toggleProviderVerified(
  providerId: string,
  verified: boolean
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.serviceProvider.update({
      where: { id: providerId },
      data: { verified },
    });
    revalidatePath("/admin");
    revalidatePath("/services");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}
