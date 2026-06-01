/** Server Component */
/** /onboarding — первый вход: выбор роли и базовые настройки */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const metadata = { title: "Добро пожаловать — ЛапМаркет" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingDone: true, role: true },
  });

  if (user?.onboardingDone || user?.role !== "OWNER") {
    redirect("/profile");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-stone-900">Настройте паспорт питомца</h1>
      <p className="mt-2 text-stone-600">
        Три шага: питомец → первая прививка → напоминание
      </p>
      <OnboardingForm />
    </div>
  );
}
