/** Server Component — соцсети в HTML сразу (без ожидания JS) */

import { SOCIAL_LINKS } from "@/lib/social";

const iconClass =
  "h-5 w-5 shrink-0 text-stone-600 transition-colors hover:text-[#10b981]";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12.1 12.1 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function VkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.225 10.857 3.026 8.87 3.026 8.87s-.102-.254 0-.389c.102-.102.305-.102.305-.102h1.93s.187.034.305.254c.712 1.304 2.52 3.896 3.375 3.896.254 0 .373-.102.373-.661V9.721c-.068-1.118-.661-1.219-.661-1.525 0-.187.153-.305.407-.305h3.034c.339 0 .458.187.458.61v2.501c0 .339.152.458.254.458.204 0 .373-.102.746-.475 1.15-1.287 1.965-3.286 1.965-3.286s.102-.204.254-.254h1.93s.458.102.339.525c-.102.339-1.49 2.889-1.49 2.889.204.339.407.712.576 1.067z" />
    </svg>
  );
}

const items = [
  { href: SOCIAL_LINKS.telegram, label: "Telegram — ЛапМаркет", Icon: TelegramIcon },
  { href: SOCIAL_LINKS.vk, label: "ВКонтакте — ЛапМаркет", Icon: VkIcon },
] as const;

type SocialLinksStaticProps = {
  variant?: "header" | "footer" | "mobile-bar" | "mobile-menu";
};

function SocialAnchors({ large }: { large?: boolean }) {
  const size = large ? "h-6 w-6" : iconClass;
  return (
    <ul className="flex items-center gap-2">
      {items.map(({ href, label, Icon }) => (
        <li key={href}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl p-2 active:scale-95"
          >
            <Icon className={size} />
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Соцсети в начальном HTML — видны на телефоне даже до загрузки JS
 */
export function SocialLinksStatic({
  variant = "header",
}: SocialLinksStaticProps) {
  if (variant === "footer") {
    return (
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-stone-700">Мы в соцсетях</span>
        <SocialAnchors />
      </div>
    );
  }

  if (variant === "mobile-bar") {
    return (
      <div
        className="flex items-center justify-center gap-3 border-b border-emerald-100 bg-white px-4 py-2.5 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
        role="navigation"
        aria-label="Соцсети ЛапМаркет"
      >
        <span className="text-xs font-semibold text-stone-700">Мы в соцсетях</span>
        <SocialAnchors large />
      </div>
    );
  }

  if (variant === "mobile-menu") {
    return (
      <div className="mt-3 border-t border-stone-100 pt-4">
        <p className="mb-2 px-4 text-xs font-medium uppercase tracking-wide text-stone-500">
          Мы в соцсетях
        </p>
        <div className="px-2">
          <SocialAnchors large />
        </div>
      </div>
    );
  }

  return <SocialAnchors />;
}

/** Полоска над нижним меню (только мобильные) */
export function SocialMobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] z-[55] md:hidden">
      <SocialLinksStatic variant="mobile-bar" />
    </div>
  );
}
