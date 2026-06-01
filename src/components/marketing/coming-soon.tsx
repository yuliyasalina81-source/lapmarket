/** Server Component */
/** Заглушка для разделов в разработке */

import Link from "next/link";
import { Lock } from "lucide-react";

/**
 * Экран «Раздел скоро откроется» с кнопкой на главную.
 */
export function ComingSoon() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 shadow-inner"
        aria-hidden
      >
        <Lock className="h-10 w-10 text-emerald-600" strokeWidth={1.75} />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
        Раздел скоро откроется
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-600">
        Мы готовим этот раздел к запуску. Пока доступны паспорт питомца, лента и
        услуги.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-900/15 transition hover:bg-emerald-700 active:scale-[0.98]"
      >
        На главную
      </Link>
    </div>
  );
}
