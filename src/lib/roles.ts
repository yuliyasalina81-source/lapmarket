import type { UserRole } from "@prisma/client";

export const roleLabels: Record<UserRole, string> = {
  OWNER: "Владелец",
  SELLER: "Продавец",
  SHELTER: "Приют",
  ADMIN: "Администратор",
};
