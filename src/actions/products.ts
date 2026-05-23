"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { isCertifiedSeller } from "@/lib/user";
import type { ProductCategory, ProductStatus } from "@prisma/client";

async function resolveProductMediaIds(
  formData: FormData,
  userId: string
): Promise<string[]> {
  const raw = formData
    .getAll("mediaIds")
    .map((v) => String(v).trim())
    .filter(Boolean);
  if (raw.length === 0) return [];
  const owned = await prisma.mediaAsset.findMany({
    where: { id: { in: raw }, userId },
    select: { id: true },
  });
  const set = new Set(owned.map((m) => m.id));
  return raw.filter((id) => set.has(id));
}

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

export async function createProduct(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    if (user.role !== "SELLER") {
      return { ok: false, error: "Только продавцы могут добавлять товары" };
    }
    if (!(await isCertifiedSeller(user.id))) {
      return {
        ok: false,
        error: "Дождитесь сертификации продавца",
      };
    }

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const price = parseInt(formData.get("price") as string, 10);
    const category = formData.get("category") as ProductCategory;
    const status = (formData.get("status") as ProductStatus) || "DRAFT";

    if (!title || !description || isNaN(price)) {
      return { ok: false, error: "Заполните все обязательные поля" };
    }

    const product = await prisma.product.create({
      data: {
        sellerId: user.id,
        title,
        description,
        price,
        category,
        status,
      },
    });

    const mediaIds = await resolveProductMediaIds(formData, user.id);
    let order = 0;
    for (const mediaId of mediaIds) {
      await prisma.productImage.create({
        data: { productId: product.id, mediaId, sortOrder: order++ },
      });
    }

    revalidatePath("/market");
    revalidatePath("/seller/products");
    return { ok: true, id: product.id };
  } catch {
    return { ok: false, error: "Не удалось создать товар" };
  }
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.sellerId !== user.id) {
      return { ok: false, error: "Товар не найден" };
    }

    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const price = parseInt(formData.get("price") as string, 10);
    const category = formData.get("category") as ProductCategory;
    const status = formData.get("status") as ProductStatus;

    await prisma.product.update({
      where: { id },
      data: { title, description, price, category, status },
    });

    const mediaIds = await resolveProductMediaIds(formData, user.id);
    if (mediaIds.length > 0) {
      let order = await prisma.productImage.count({ where: { productId: id } });
      for (const mediaId of mediaIds) {
        await prisma.productImage.create({
          data: { productId: id, mediaId, sortOrder: order++ },
        });
      }
    }

    revalidatePath("/market");
    revalidatePath(`/market/${id}`);
    revalidatePath("/seller/products");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось обновить товар" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product || product.sellerId !== user.id) {
      return { ok: false, error: "Товар не найден" };
    }
    await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    revalidatePath("/market");
    revalidatePath("/seller/products");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось удалить товар" };
  }
}

export async function removeProductImage(imageId: string): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: true },
    });
    if (!image || image.product.sellerId !== user.id) {
      return { ok: false, error: "Изображение не найдено" };
    }
    await prisma.productImage.delete({ where: { id: imageId } });
    revalidatePath(`/market/${image.productId}`);
    revalidatePath("/seller/products");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось удалить фото" };
  }
}

export async function requestCertification(
  note?: string
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    if (user.role !== "SELLER") {
      return { ok: false, error: "Только для продавцов" };
    }
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) return { ok: false, error: "Профиль продавца не найден" };
    if (profile.tier === "CERTIFIED") {
      return { ok: false, error: "Вы уже сертифицированы" };
    }

    const existing = await prisma.sellerCertificationRequest.findFirst({
      where: { sellerProfileId: profile.id, status: "PENDING" },
    });
    if (existing) {
      return { ok: false, error: "Заявка уже на рассмотрении" };
    }

    await prisma.sellerCertificationRequest.create({
      data: { sellerProfileId: profile.id, note: note?.trim() },
    });

    revalidatePath("/seller/products");
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось отправить заявку" };
  }
}
