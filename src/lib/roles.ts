/**
 * Константы ролей: человекочитаемые подписи UserRole для UI.
 */
import type { UserRole } from "@prisma/client";

/** Отображаемые названия ролей пользователя. */
export const roleLabels: Record<UserRole, string> = {
  OWNER: "Владелец",
  SELLER: "Продавец",
  SHELTER: "Приют",
  SPECIALIST: "Специалист",
  ADMIN: "Администратор",
};
