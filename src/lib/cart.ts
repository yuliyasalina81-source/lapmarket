export const CART_KEY = "lapmarket_cart";

export type CartLine = { productId: string; quantity: number };

export function getCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveCart(cart: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("lapmarket-cart"));
}

export function addToCart(productId: string) {
  const cart = getCart();
  const existing = cart.find((i) => i.productId === productId);
  if (existing) existing.quantity += 1;
  else cart.push({ productId, quantity: 1 });
  saveCart(cart);
}

export function removeFromCart(productId: string) {
  saveCart(getCart().filter((i) => i.productId !== productId));
}

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

export function clearCart() {
  saveCart([]);
}

export function cartCount(): number {
  return getCart().reduce((s, i) => s + i.quantity, 0);
}
