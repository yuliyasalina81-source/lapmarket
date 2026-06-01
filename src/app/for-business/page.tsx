/** Server Component */
/** /for-business — лендинг для клиник и партнёров, форма заявки */
import { ForBusinessHero } from "@/components/marketing/for-business-hero";
import { ForBusinessSteps } from "@/components/marketing/for-business-steps";
import { ForBusinessBenefits } from "@/components/marketing/for-business-benefits";
import { PartnerLeadForm } from "@/components/marketing/PartnerLeadForm";
import { ForBusinessFaq } from "@/components/marketing/for-business-faq";

export const metadata = {
  title: "Для бизнеса — ЛапМаркет",
  description:
    "Подключите ветклинику или салон груминга к ЛапМаркет: онлайн-запись, новые клиенты, 0% комиссии для первых партнёров.",
};

export default function ForBusinessPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:max-w-4xl">
      <ForBusinessHero />
      <ForBusinessSteps />
      <ForBusinessBenefits />

      <section id="partner-form" className="mt-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-stone-900">Оставить заявку</h2>
        <p className="mt-2 text-stone-600">
          Расскажите о клинике или салоне — мы поможем с подключением
        </p>
        <div className="mt-6 rounded-2xl border border-stone-100 bg-white p-6 shadow-sm">
          <PartnerLeadForm />
        </div>
      </section>

      <ForBusinessFaq />
    </div>
  );
}
