/**
 * Работа с сессией NextAuth на сервере: получение пользователя,
 * проверка ролей и редирект на логин для защищённых страниц.
 */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { UserRole } from "@prisma/client";

/**
 * Возвращает пользователя из сессии или null.
 * @returns user из JWT или null, если не авторизован
 */
export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

/**
 * Требует авторизованного пользователя.
 * @returns Объект пользователя сессии
 * @throws Error "UNAUTHORIZED"
 */
export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

/**
 * Требует одну из переданных ролей.
 * @param roles Допустимые роли UserRole
 * @returns Пользователь с подходящей ролью
 * @throws Error "FORBIDDEN" при несовпадении роли
 */
export async function requireRole(...roles: UserRole[]) {
  const user = await requireSessionUser();
  if (!roles.includes(user.role as UserRole)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Возвращает пользователя или выполняет redirect на /login.
 * @param callbackUrl Опциональный URL возврата после входа
 * @returns Авторизованный пользователь (never при редиректе)
 */
export async function requireSessionOrRedirect(callbackUrl?: string) {
  const user = await getSessionUser();
  if (!user) {
    const url = callbackUrl
      ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/login";
    redirect(url);
  }
  return user;
}
