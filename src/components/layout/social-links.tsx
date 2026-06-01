"use client";

/** Ссылки на Telegram и VK с фирменными иконками */

import { TelegramBrandIcon, VkBrandIcon } from "@/components/icons/brand-icons";
import { SOCIAL_LINKS } from "@/lib/social";

const iconClass =
  "h-5 w-5 shrink-0 text-stone-500 transition-colors group-hover:text-[#10b981]";

const items = [
  {
    href: SOCIAL_LINKS.telegram,
    label: "Telegram — ЛапМаркет",
    Icon: TelegramBrandIcon,
  },
  {
    href: SOCIAL_LINKS.vk,
    label: "ВКонтакте — ЛапМаркет",
    Icon: VkBrandIcon,
  },
] as const;

type SocialLinksProps = {
  /** header — шапка; footer — подвал; mobile-menu — бургер-меню; mobile-bar — над нижней панелью */
  variant?: "header" | "footer" | "mobile-menu" | "mobile-bar";
};

/**
 * Кликабельные ссылки на Telegram и VK
 */
export function SocialLinks({ variant = "header" }: SocialLinksProps) {
  const links = (
    <ul className="flex items-center gap-3">
      {items.map(({ href, label, Icon }) => (
        <li key={href}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="group inline-flex rounded-lg p-1 transition active:scale-95"
          >
            <Icon className={iconClass} />
          </a>
        </li>
      ))}
    </ul>
  );

  if (variant === "footer") {
    return (
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-stone-700">Мы в соцсетях</span>
        {links}
      </div>
    );
  }

  if (variant === "mobile-menu") {
    return (
      <div className="mt-3 border-t border-stone-100 pt-4">
        <p className="mb-2 px-4 text-xs font-medium uppercase tracking-wide text-stone-500">
          Мы в соцсетях
        </p>
        <div className="flex items-center gap-2 px-4">{links}</div>
      </div>
    );
  }

  if (variant === "mobile-bar") {
    return (
      <div className="flex items-center justify-center gap-4 border-b border-amber-100/90 bg-white/95 px-4 py-2 backdrop-blur-md">
        <span className="text-xs font-medium text-stone-600">Мы в соцсетях</span>
        {links}
      </div>
    );
  }

  return links;
}
