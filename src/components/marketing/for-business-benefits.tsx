import { BadgePercent, Headphones, ShieldCheck } from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Без скрытых платежей",
    text: "Комиссия только с подтверждённых записей",
  },
  {
    icon: BadgePercent,
    title: "Старт без комиссии",
    text: "Первые 10 партнёров — 0% комиссии на 2 месяца",
  },
  {
    icon: Headphones,
    title: "Помощь в настройке",
    text: "Поможем оформить профиль и подключить услуги",
  },
];

export function ForBusinessBenefits() {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-stone-900">Преимущества</h2>
      <ul className="mt-8 space-y-4">
        {benefits.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex gap-4 rounded-2xl border border-stone-100 bg-white p-5 shadow-sm"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-semibold text-stone-900">{title}</h3>
              <p className="mt-1 text-sm text-stone-600">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
