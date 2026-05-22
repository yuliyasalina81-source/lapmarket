import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Введите корректный email"),
    password: z
      .string()
      .min(8, "Пароль должен быть не менее 8 символов"),
    displayName: z
      .string()
      .min(2, "Имя должно быть не менее 2 символов")
      .max(80),
    city: z.string().max(100).optional(),
    avatar: z.string().max(10).optional(),
    role: z.enum(["OWNER", "SELLER", "SHELTER"]),
    pets: z.string().optional(),
    shopName: z.string().optional(),
    shopDescription: z.string().optional(),
    organizationName: z.string().optional(),
    shelterDescription: z.string().optional(),
    shelterCity: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "SELLER") {
      if (!data.shopName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите название магазина",
          path: ["shopName"],
        });
      }
      if (!data.shopDescription?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Добавьте описание магазина",
          path: ["shopDescription"],
        });
      }
    }
    if (data.role === "SHELTER") {
      if (!data.organizationName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите название организации",
          path: ["organizationName"],
        });
      }
      if (!data.shelterDescription?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Добавьте описание приюта",
          path: ["shelterDescription"],
        });
      }
      if (!data.shelterCity?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите город",
          path: ["shelterCity"],
        });
      }
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
