/** Server Actions для объявлений о животных */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { createNotification } from "@/lib/notifications";
import type { AnimalBadge, AnimalKind, ContactRequestStatus } from "@prisma/client";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

/**
 * Создаёт объявление о животном (SELLER или SHELTER).
 * @param formData — поля карточки и mediaIds
 * @returns ActionResult с id объявления
 */
export async function createListing(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    if (user.role !== "SELLER" && user.role !== "SHELTER") {
      return { ok: false, error: "Только продавцы и приюты могут создавать объявления" };
    }

    const name = (formData.get("name") as string)?.trim();
    const kind = formData.get("kind") as AnimalKind;
    const breed = (formData.get("breed") as string)?.trim() || undefined;
    const age = (formData.get("age") as string)?.trim();
    const city = (formData.get("city") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const priceRaw = formData.get("price") as string;
    const price = priceRaw ? parseInt(priceRaw, 10) : undefined;
    const badges = formData.getAll("badges") as AnimalBadge[];

    // Обязательные поля и хотя бы один badge
    if (!name || !age || !city || !description || badges.length === 0) {
      return { ok: false, error: "Заполните все обязательные поля" };
    }

    const listing = await prisma.animalListing.create({
      data: {
        authorId: user.id,
        name,
        kind,
        breed,
        age,
        city,
        price: isNaN(price as number) ? undefined : price,
        badges,
        description,
        status: "PENDING",
      },
    });

    const mediaIds = formData
      .getAll("mediaIds")
      .map((v) => String(v).trim())
      .filter(Boolean);
    if (mediaIds.length > 0) {
      const owned = await prisma.mediaAsset.findMany({
        where: { id: { in: mediaIds }, userId: user.id },
        select: { id: true },
      });
      const set = new Set(owned.map((m) => m.id));
      let order = 0;
      for (const id of mediaIds) {
        if (!set.has(id)) continue;
        await prisma.animalListingImage.create({
          data: { listingId: listing.id, mediaId: id, sortOrder: order++ },
        });
      }
    }

    revalidatePath("/animals");
    revalidatePath("/listings");
    return { ok: true, id: listing.id };
  } catch {
    return { ok: false, error: "Не удалось создать объявление" };
  }
}

/**
 * Отправляет первичный запрос по объявлению автору.
 * @param listingId — идентификатор AnimalListing
 * @param message — текст сообщения
 * @returns ActionResult
 */
export async function createContactRequest(
  listingId: string,
  message: string
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const text = message.trim();
    if (!text) return { ok: false, error: "Введите сообщение" };

    const listing = await prisma.animalListing.findUnique({
      where: { id: listingId },
      select: { authorId: true, name: true },
    });
    if (!listing) return { ok: false, error: "Объявление не найдено" };

    await prisma.contactRequest.create({
      data: { listingId, fromUserId: user.id, message: text },
    });

    await createNotification({
      userId: listing.authorId,
      type: "CONTACT_REQUEST",
      title: "Новый запрос по объявлению",
      body: `${user.displayName ?? "Пользователь"} — ${listing.name}`,
      link: "/profile/inbox",
    });

    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось отправить заявку" };
  }
}

/**
 * Меняет статус входящего контакта (только автор объявления).
 * @param id — идентификатор ContactRequest
 * @param status — ContactRequestStatus
 * @returns ActionResult
 */
export async function updateContactStatus(
  id: string,
  status: ContactRequestStatus
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const contact = await prisma.contactRequest.findUnique({
      where: { id },
      include: { listing: { select: { authorId: true } } },
    });
    if (!contact || contact.listing.authorId !== user.id) {
      return { ok: false, error: "Недостаточно прав" };
    }

    await prisma.contactRequest.update({ where: { id }, data: { status } });
    revalidatePath("/profile/inbox");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}

/**
 * Публикует или отклоняет объявление (модерация ADMIN).
 * @param id — идентификатор объявления
 * @param action — publish или reject
 * @returns ActionResult
 */
export async function moderateListing(
  id: string,
  action: "publish" | "reject"
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    if (user.role !== "ADMIN") {
      return { ok: false, error: "Недостаточно прав" };
    }

    await prisma.animalListing.update({
      where: { id },
      data: { status: action === "publish" ? "PUBLISHED" : "REJECTED" },
    });

    revalidatePath("/admin");
    revalidatePath("/animals");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка модерации" };
  }
}
