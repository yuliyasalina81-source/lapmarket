/** Server Component */
/** Шаги подключения бизнеса к платформе */

const steps = [
  {
    emoji: "📝",
    title: "Регистрация за 10 минут",
    text: "Заполните карточку, загрузите лицензию",
  },
  {
    emoji: "📅",
    title: "Клиенты сами записываются",
    text: "Видят цены, услуги и свободное время",
  },
  {
    emoji: "✅",
    title: "Вы получаете заявку",
    text: "Подтверждаете и принимаете клиента",
  },
];

/**
 * Блок «Как начать» для партнёров
 */
export function ForBusinessSteps() {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-stone-900">Как это работает</h2>
      <ul className="mt-8 grid gap-6 sm:grid-cols-3">
        {steps.map((step) => (
          <li
            key={step.title}
            className="rounded-2xl border border-white/80 bg-white p-6 shadow-sm"
          >
            <span className="text-3xl" aria-hidden>
              {step.emoji}
            </span>
            <h3 className="mt-4 font-semibold text-stone-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              {step.text}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
