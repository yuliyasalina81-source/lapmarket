/**
 * Охрана API и server actions: проверка сессии NextAuth и ролей.
 * Бросает Error с кодами UNAUTHORIZED / FORBIDDEN при отказе.
 */
import { auth } from "@/lib/auth";
import type { UserRole } from "@prisma/client";

/**
 * Требует авторизованного пользователя из сессии.
 * @returns Объект пользователя из JWT-сессии
 * @throws Error "UNAUTHORIZED" без id в сессии
 */
export async function requireAuthUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}

/**
 * Требует роль администратора.
 * @returns Пользователь с role === ADMIN
 * @throws Error "FORBIDDEN" для остальных ролей
 */
export async function requireAdminUser() {
  const user = await requireAuthUser();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Требует роль специалиста или администратора.
 * @returns Пользователь SPECIALIST или ADMIN
 * @throws Error "FORBIDDEN" для остальных ролей
 */
export async function requireSpecialistUser() {
  const user = await requireAuthUser();
  if (user.role !== "SPECIALIST" && user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Сопоставляет роль Prisma с ролью профиля в Supabase.
 * @param role Роль из Prisma UserRole
 * @returns Роль для таблицы profiles в Supabase
 */
export function mapPrismaRoleToProfileRole(
  role: UserRole
): "client" | "specialist" | "admin" {
  if (role === "ADMIN") return "admin";
  if (role === "SPECIALIST") return "specialist";
  return "client";
}
