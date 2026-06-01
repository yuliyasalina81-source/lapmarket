/**
 * Форматирование цен и рейтингов для отображения в интерфейсе (ru-RU).
 */

/**
 * Форматирует сумму в рублях без копеек.
 * @param amount Число в минимальных единицах валюты
 * @param currency Код валюты (по умолчанию RUB)
 * @returns Строка вида «1 234 ₽»
 */
export function formatPrice(amount: number, currency: "RUB" = "RUB"): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Форматирует рейтинг с одним знаком после запятой.
 * @param value Числовой рейтинг
 * @returns Строка, например «4.5»
 */
export function formatRating(value: number): string {
  return value.toFixed(1);
}
