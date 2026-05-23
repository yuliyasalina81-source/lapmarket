import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServiceProviders } from "@/lib/queries/services";
import { ServicesView } from "@/components/services/services-view";

export const metadata = {
  title: "Услуги — ЛапМаркет",
};

export default async function ServicesPage() {
  const session = await auth();
  const providers = await getServiceProviders();
  const pets = session?.user?.id
    ? await prisma.pet.findMany({
        where: { userId: session.user.id },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];
  return (
    <ServicesView
      providers={providers}
      isLoggedIn={!!session?.user}
      pets={pets}
    />
  );
}
