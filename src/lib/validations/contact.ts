/**
 * Zod-схема заявки с виджета «Связаться с нами» и других контактных форм.
 */
import { z } from "zod";

const optionalTrimmed = z
  .string()
  .optional()
  .transform((v) => (v?.trim() ? v.trim() : undefined));

export const contactRequestSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Имя должно быть не менее 2 символов")
      .max(100, "Слишком длинное имя"),
    email: optionalTrimmed,
    phone: optionalTrimmed,
    message: z
      .string()
      .max(5000, "Сообщение слишком длинное")
      .optional()
      .transform((v) => (v?.trim() ? v.trim() : undefined)),
    source: z.enum(["chat", "partner"]).optional().default("chat"),
    /** Honeypot (checkbox) — не должен приходить от реальных пользователей */
    _hp: z.union([z.string(), z.number(), z.boolean()]).optional(),
    clinicName: optionalTrimmed,
    city: optionalTrimmed,
  })
  .superRefine((data, ctx) => {
    if (data.email && !z.string().email().safeParse(data.email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Введите корректный email",
        path: ["email"],
      });
    }

    if (data.source === "chat" && !data.email && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Укажите email или телефон",
        path: ["email"],
      });
    }

    if (data.source === "partner") {
      if (!data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите email",
          path: ["email"],
        });
      }
      if (!data.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите телефон",
          path: ["phone"],
        });
      }
    }
  });

export type ContactRequestInput = z.infer<typeof contactRequestSchema>;
