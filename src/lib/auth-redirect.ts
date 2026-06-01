/**
 * Маршруты после входа и ссылки на профиль в зависимости от авторизации.
 */
import type { UserRole } from "@prisma/client";

/**
 * Целевой путь после успешного логина по роли.
 * @param role Роль пользователя (Prisma или строка из JWT)
 * @returns URL для redirect
 */
export function resolvePostLoginPath(role?: UserRole | string): string {
  if (role === "SPECIALIST") return "/dashboard/specialist";
  if (role === "ADMIN") return "/admin";
  return "/profile";
}

/**
 * Ссылка на профиль или логин с callbackUrl.
 * @param authenticated Есть ли активная сессия
 * @returns href для навигации
 */
export function profileNavHref(authenticated: boolean): string {
  if (!authenticated) return "/login?callbackUrl=/profile";
  return "/profile";
}
