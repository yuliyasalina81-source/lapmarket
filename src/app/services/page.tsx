import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getApprovedSpecialists } from "@/lib/queries/services-supabase";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { ServicesView } from "@/components/services/services-view";
import type { ServiceKind } from "@prisma/client";

export const metadata = {
  title: "Услуги — ЛапМаркет",
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; city?: string; priceMax?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const kind =
    params.kind && params.kind in { VETERINARY: 1, GROOMING: 1, TRAINING: 1, BOARDING: 1, OTHER: 1 }
      ? (params.kind as ServiceKind)
      : undefined;

  const providers = await getApprovedSpecialists({
    kind,
    city: params.city,
    priceMax: params.priceMax ? Number(params.priceMax) : undefined,
  });

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
      useSupabase={isSupabaseConfigured()}
    />
  );
}
