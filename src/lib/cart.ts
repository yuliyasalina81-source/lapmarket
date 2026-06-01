/**
 * Корзина маркетплейса в localStorage (клиент): добавление, количество, очистка.
 */
export const CART_KEY = "lapmarket_cart";

/** Строка корзины: товар и количество. */
export type CartLine = { productId: string; quantity: number };

/**
 * Читает корзину из localStorage (только в браузере).
 * @returns Массив позиций или пустой массив на сервере / при ошибке парсинга
 */
export function getCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/**
 * Сохраняет корзину и уведомляет подписчиков через событие lapmarket-cart.
 * @param cart Актуальный массив позиций
 */
function saveCart(cart: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("lapmarket-cart"));
}

/**
 * Добавляет товар в корзину или увеличивает количество на 1.
 * @param productId Идентификатор товара
 */
export function addToCart(productId: string) {
  const cart = getCart();
  const existing = cart.find((i) => i.productId === productId);
  if (existing) existing.quantity += 1;
  else cart.push({ productId, quantity: 1 });
  saveCart(cart);
}

/**
 * Удаляет товар из корзины.
 * @param productId Идентификатор товара
 */
export function removeFromCart(productId: string) {
  saveCart(getCart().filter((i) => i.productId !== productId));
}

/**
 * Устанавливает количество; при quantity <= 0 удаляет позицию.
 * @param productId Идентификатор товара
 * @param quantity Новое количество
 */
export function setQuantity(productId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  const cart = getCart();
  const line = cart.find((i) => i.productId === productId);
  if (line) line.quantity = quantity;
  else cart.push({ productId, quantity });
  saveCart(cart);
}

/** Очищает корзину. */
export function clearCart() {
  saveCart([]);
}

/**
 * Суммарное количество единиц товаров в корзине.
 * @returns Сумма quantity по всем строкам
 */
export function cartCount(): number {
  return getCart().reduce((s, i) => s + i.quantity, 0);
}
