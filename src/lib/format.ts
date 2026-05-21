export function formatPrice(amount: number, currency: "RUB" = "RUB"): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRating(value: number): string {
  return value.toFixed(1);
}
