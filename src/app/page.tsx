import Link from "next/link";
import {
  BadgeCheck,
  Heart,
  PawPrint,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  Users,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Соцсеть для владельцев",
    text: "Лента, посты о питомцах, лайки с анимацией и живое сообщество.",
    href: "/feed",
  },
  {
    icon: ShieldCheck,
    title: "Только сертифицированные продавцы",
    text: "Обычные темники не публикуют товары — только проверенные магазины.",
    href: "/market",
  },
  {
    icon: ShoppingBag,
    title: "Маркет товаров",
    text: "Корм, игрушки, лежанки, аптека — с бейджем «Сертифицировано».",
    href: "/market",
  },
  {
    icon: PawPrint,
    title: "Покупка и усыновление",
    text: "С галочкой и паспортом или в добрые руки с сердечком.",
    href: "/animals",
  },
  {
    icon: Stethoscope,
    title: "Ветеринары и грумеры",
    text: "Запись к специалистам с бейджем «Лицензия проверена».",
    href: "/services",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 via-emerald-500/85 to-violet-500/80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-white sm:px-6 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-100">
            ЛапМаркет · соцсеть · маркет · услуги
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Всё для вашего питомца в одном премиум-пространстве
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">
            Товары только от сертифицированных продавцов, животные с паспортом
            или в добрые руки, ветеринары и грумеры с проверенной лицензией.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-emerald-800 shadow-xl transition hover:bg-emerald-50"
            >
              Открыть ленту
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/market"
              className="rounded-2xl border-2 border-white/50 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
            >
              Смотреть товары
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            <span className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
              <BadgeCheck className="h-4 w-4 text-emerald-200" />
              С галочкой — паспорт
            </span>
            <span className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
              <Heart className="h-4 w-4 fill-red-300 text-red-300" />
              С сердечком — в добрые руки
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          Разделы ЛапМаркет
        </h2>
        <p className="mt-2 max-w-xl text-stone-600">
          Полностью рабочий прототип на мок-данных: модалки, фильтры, лайки и
          запись к специалистам.
        </p>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text, href }) => (
            <li key={title}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-2xl border border-white/80 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-stone-900">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
                  {text}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                  Перейти
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
