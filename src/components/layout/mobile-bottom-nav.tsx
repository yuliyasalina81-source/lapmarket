"use client";

/** Client Component */
/** Нижняя навигация на мобильных */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { useSession } from "next-auth/react";
import { mobileNav, type NavItem } from "@/lib/nav";
import { profileNavHref } from "@/lib/auth-redirect";
import { filterNavByRole } from "@/lib/coming-soon";
import { SocialLinks } from "@/components/layout/social-links";

/**
 * Подсвечивает пункт нижнего меню по текущему pathname
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/login")) {
    return pathname === "/profile" || pathname.startsWith("/profile/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Таб-бар основных разделов для смартфонов
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const profileHref = profileNavHref(status === "authenticated");

  const profileTab: NavItem = {
    href: profileHref,
    label: "Профиль",
    icon: User,
  };

  const items = [...filterNavByRole(mobileNav, session?.user?.role), profileTab];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <SocialLinks variant="mobile-bar" />
      <nav
        className="border-t border-amber-100/90 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
        aria-label="Нижняя навигация"
      >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium transition active:scale-95 ${
                  active
                    ? "text-teal-700"
                    : "text-stone-500 hover:text-stone-700"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${active ? "text-teal-600" : ""}`}
                  aria-hidden
                />
                <span className="max-w-full truncate">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      </nav>
    </div>
  );
}
