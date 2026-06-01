/**
 * Разделы «Скоро откроется»: маршруты и доступ по роли.
 */

/** Роли с полным доступом к маркету и объявлениям. */
export const COMING_SOON_BYPASS_ROLES = ["ADMIN", "SELLER"] as const;

export function canBypassComingSoon(role?: string | null): boolean {
  return (
    role === "ADMIN" ||
    role === "SELLER"
  );
}

/** Закрытые маршруты (включая вложенные /animals/[id], /market/[id]). */
export function isComingSoonPath(pathname: string): boolean {
  if (pathname === "/listings/new") return true;
  if (pathname === "/animals" || pathname.startsWith("/animals/")) return true;
  if (pathname === "/market" || pathname.startsWith("/market/")) return true;
  return false;
}

/** Пункты меню, скрываемые для обычных пользователей. */
export const COMING_SOON_NAV_HREFS = ["/market", "/animals"] as const;

export function filterNavByRole<T extends { href: string }>(
  items: T[],
  role?: string | null
): T[] {
  if (canBypassComingSoon(role)) return items;
  return items.filter(
    (item) =>
      !COMING_SOON_NAV_HREFS.includes(
        item.href as (typeof COMING_SOON_NAV_HREFS)[number]
      )
  );
}
