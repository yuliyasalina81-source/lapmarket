/**
 * Zod-схемы для услуг специалиста.
 */
import { z } from "zod";

export const serviceCategorySchema = z.enum([
  "GROOMING",
  "VET",
  "TRAINING",
  "BOARDING",
  "OTHER",
]);

export const createServiceSchema = z.object({
  name: z.string().trim().min(2, "Название от 2 символов"),
  description: z.string().trim().optional(),
  price: z.coerce.number().int().min(0, "Цена не может быть отрицательной"),
  duration: z.coerce.number().int().min(1, "Длительность от 1 минуты"),
  category: serviceCategorySchema,
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export function firstZodError(flat: {
  fieldErrors: Record<string, string[] | undefined>;
  formErrors: string[];
}): string {
  for (const messages of Object.values(flat.fieldErrors)) {
    if (messages?.[0]) return messages[0];
  }
  return flat.formErrors[0] ?? "Проверьте данные формы";
}
