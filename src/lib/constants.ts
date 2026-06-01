/**
 * Константы приложения: подписи категорий товаров и услуг,
 * виды животных, демо-URL изображений и вспомогательные проверки.
 */
import type {
  AnimalKind,
  ProductCategory,
  ServiceKind,
} from "@prisma/client";

/** Человекочитаемые названия категорий товаров. */
export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  FOOD: "Корм",
  TOYS: "Игрушки",
  BEDS: "Лежанки",
  PHARMACY: "Аптека",
};

/** Список всех категорий товаров для селектов и фильтров. */
export const PRODUCT_CATEGORIES = Object.keys(
  PRODUCT_CATEGORY_LABELS
) as ProductCategory[];

/** Подписи видов животных в объявлениях и паспорте. */
export const ANIMAL_KIND_LABELS: Record<AnimalKind, string> = {
  DOG: "Собака",
  CAT: "Кошка",
  BIRD: "Птица",
  RODENT: "Грызун",
  OTHER: "Другое",
};

/** Подписи типов услуг специалистов. */
export const SERVICE_KIND_LABELS: Record<ServiceKind, string> = {
  VETERINARY: "Ветеринария",
  GROOMING: "Груминг",
  TRAINING: "Дрессировка",
  BOARDING: "Передержка",
  OTHER: "Другое",
};

/** URL демо-изображений (Unsplash) для сидов и заглушек. */
export const DEMO_IMAGE_URLS = {
  dog: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
  cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80",
  food: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&q=80",
  toy: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80",
  bed: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=800&q=80",
  vet: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&q=80",
  groom: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d4?w=800&q=80",
  post1: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80",
  post2: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800&q=80",
} as const;

/**
 * Проверяет, что строка похожа на абсолютный URL изображения.
 * @param value Строка для проверки
 * @returns true, если начинается с http:// или https://
 */
export function isImageUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}
