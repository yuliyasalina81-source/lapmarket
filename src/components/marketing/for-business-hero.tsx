/** Server Component */
/** Hero-блок лендинга «Для бизнеса» */

import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Первый экран страницы для ветклиник и грумеров
 */
export function ForBusinessHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 py-12 text-white shadow-lg shadow-emerald-900/15 sm:px-10 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-100">
        Для ветклиник и салонов груминга
      </p>
      <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        Привлекайте клиентов в свою ветклинику или салон груминга
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/90">
        Платформа ЛапМаркет поможет вам заполнить свободные часы онлайн-записью
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#partner-form"
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
        >
          Оставить заявку
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
        <Link
          href="/register"
          className="rounded-2xl border-2 border-white/50 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
        >
          Зарегистрироваться как специалист
        </Link>
      </div>
    </section>
  );
}
