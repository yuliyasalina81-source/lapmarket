/**
 * Zod-схемы для расписания и слотов специалиста.
 */
import { z } from "zod";
import { firstZodError } from "@/lib/validations/service";

export { firstZodError };

const timeRegex = /^\d{2}:\d{2}$/;

export const availabilityItemSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, "Формат HH:mm"),
  endTime: z.string().regex(timeRegex, "Формат HH:mm"),
});

export const availabilityBulkSchema = z.object({
  items: z.array(availabilityItemSchema).min(1, "Укажите хотя бы один день"),
});

export const slotsQuerySchema = z.object({
  providerId: z.string().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  serviceId: z.string().optional(),
});

export function isValidTimeRange(startTime: string, endTime: string): boolean {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return sh * 60 + sm < eh * 60 + em;
}
