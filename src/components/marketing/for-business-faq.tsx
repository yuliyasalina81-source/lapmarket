"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqItems = [
  {
    q: "Сколько стоит?",
    a: "Комиссия взимается только с подтверждённых записей. Первые 10 партнёров в Москве получают 0% комиссии на первые 2 месяца.",
  },
  {
    q: "Нужно ли устанавливать софт?",
    a: "Нет. Достаточно браузера: вы регистрируетесь на платформе, настраиваете профиль и принимаете заявки в личном кабинете.",
  },
  {
    q: "Как я получу деньги за услугу?",
    a: "Оплата услуги происходит напрямую между вами и клиентом. При подключении мы подскажем удобный порядок расчётов для вашей клиники или салона.",
  },
];

export function ForBusinessFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-stone-900">Частые вопросы</h2>
      <ul className="mt-6 space-y-3">
        {faqItems.map((item, i) => {
          const open = openIndex === i;
          return (
            <li
              key={item.q}
              className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-semibold text-stone-900"
                aria-expanded={open}
              >
                {item.q}
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-stone-400 transition ${open ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
              {open && (
                <p className="border-t border-stone-50 px-5 pb-4 pt-2 text-sm leading-relaxed text-stone-600">
                  {item.a}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
