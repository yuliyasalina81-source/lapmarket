/** Server Component */
/** Подвал сайта со ссылками и контактами */

import Link from "next/link";
import { PawPrint } from "lucide-react";
import { SocialLinksStatic } from "@/components/layout/social-links-static";

/**
 * Футер с навигацией и копирайтом
 */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/60 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="flex items-center gap-2 font-bold text-stone-900">
              <PawPrint className="h-5 w-5 text-emerald-600" />
              Лап<span className="text-emerald-600">Маркет</span>
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600">
              Цифровой паспорт питомца, маркет от сертифицированных продавцов,
              объявления и запись к ветеринару.
            </p>
            <SocialLinksStatic variant="footer" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-800">Разделы</p>
            <ul className="mt-3 space-y-2 text-sm text-stone-600">
              <li>
                <Link href="/pets" className="hover:text-emerald-600">
                  Паспорт питомца
                </Link>
              </li>
              <li>
                <Link href="/feed" className="hover:text-emerald-600">
                  Лента
                </Link>
              </li>
              <li>
                <Link href="/market" className="hover:text-emerald-600">
                  Товары
                </Link>
              </li>
              <li>
                <Link href="/animals" className="hover:text-emerald-600">
                  Животные
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-emerald-600">
                  Вет/Груминг
                </Link>
              </li>
              <li>
                <Link href="/for-business" className="hover:text-emerald-600">
                  Для бизнеса
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-emerald-600">
                  Профиль
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-800">Обозначения</p>
            <ul className="mt-3 space-y-2 text-sm text-stone-600">
              <li>
                <span className="font-medium text-emerald-600">✓</span> С галочкой
                — породистый с паспортом
              </li>
              <li>
                <span className="font-medium text-red-500">♥</span> С сердечком —
                в добрые руки
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} ЛапМаркет ·{" "}
          <Link href="/privacy" className="hover:text-emerald-600">
            Конфиденциальность
          </Link>
        </p>
      </div>
    </footer>
  );
}
