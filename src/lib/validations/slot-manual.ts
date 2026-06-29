import { z } from "zod";

export const manualBookSlotSchema = z.object({
  clientName: z.string().trim().min(2, "Введите имя клиента"),
  phone: z.string().trim().min(5, "Введите телефон"),
  comment: z.string().trim().optional(),
  serviceId: z.string().trim().optional(),
});
