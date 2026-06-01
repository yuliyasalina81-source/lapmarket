/** Server Actions для заказов */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { createNotification } from "@/lib/notifications";
import type { OrderRequestStatus } from "@prisma/client";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

export type CartItem = { productId: string; quantity: number };

/**
 * Создаёт запрос на заказ у продавца по позициям корзины.
 * @param sellerId — идентификатор продавца
 * @param items — productId и quantity
 * @param message — комментарий покупателя
 * @returns ActionResult с id заказа
 */
export async function createOrderRequest(
  sellerId: string,
  items: CartItem[],
  message?: string
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    if (items.length === 0) return { ok: false, error: "Корзина пуста" };

    const products = await prisma.product.findMany({
      where: {
        id: { in: items.map((i) => i.productId) },
        sellerId,
        status: "PUBLISHED",
      },
    });

    // Все товары PUBLISHED и того же sellerId
    if (products.length !== items.length) {
      return { ok: false, error: "Некоторые товары недоступны" };
    }

    const order = await prisma.orderRequest.create({
      data: {
        buyerId: user.id,
        sellerId,
        message: message?.trim(),
        items: {
          create: items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: item.productId,
              quantity: item.quantity,
              priceAtOrder: product.price,
            };
          }),
        },
      },
    });

    await createNotification({
      userId: sellerId,
      type: "ORDER_REQUEST",
      title: "Новый запрос на товары",
      body: `${user.displayName ?? "Покупатель"} — ${items.length} поз.`,
      link: "/seller/orders",
    });

    revalidatePath("/seller/orders");
    revalidatePath("/profile/orders");
    return { ok: true, id: order.id };
  } catch {
    return { ok: false, error: "Не удалось отправить запрос" };
  }
}

/**
 * Меняет статус запроса (только продавец).
 * @param orderId — идентификатор OrderRequest
 * @param status — OrderRequestStatus
 * @returns ActionResult
 */
export async function updateOrderRequestStatus(
  orderId: string,
  status: OrderRequestStatus
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const order = await prisma.orderRequest.findUnique({
      where: { id: orderId },
    });
    if (!order || order.sellerId !== user.id) {
      return { ok: false, error: "Недостаточно прав" };
    }

    await prisma.orderRequest.update({ where: { id: orderId }, data: { status } });

    await createNotification({
      userId: order.buyerId,
      type: "ORDER_REQUEST",
      title: "Статус заказа обновлён",
      body: status === "CONFIRMED" ? "Продавец подтвердил запрос" : "Запрос отменён",
      link: "/profile/orders",
    });

    revalidatePath("/seller/orders");
    revalidatePath("/profile/orders");
    return { ok: true };
  } catch {
    return { ok: false, error: "Ошибка" };
  }
}

/**
 * Создаёт или обновляет отзыв на товар после подтверждённого заказа.
 * @param productId — идентификатор товара
 * @param orderRequestId — идентификатор заказа
 * @param rating — оценка 1–5
 * @param text — текст отзыва
 * @returns ActionResult
 */
export async function createProductReview(
  productId: string,
  orderRequestId: string,
  rating: number,
  text?: string
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const order = await prisma.orderRequest.findFirst({
      where: {
        id: orderRequestId,
        buyerId: user.id,
        status: "CONFIRMED",
        items: { some: { productId } },
      },
    });
    if (!order) return { ok: false, error: "Подтверждённый заказ не найден" };
    if (rating < 1 || rating > 5) return { ok: false, error: "Оценка от 1 до 5" };

    await prisma.productReview.upsert({
      where: { productId_userId: { productId, userId: user.id } },
      create: { productId, userId: user.id, rating, text: text?.trim() },
      update: { rating, text: text?.trim() },
    });

    const reviews = await prisma.productReview.findMany({
      where: { productId },
    });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await prisma.product.update({
      where: { id: productId },
      data: { rating: avg, reviewCount: reviews.length },
    });

    revalidatePath(`/market/${productId}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Не удалось оставить отзыв" };
  }
}
