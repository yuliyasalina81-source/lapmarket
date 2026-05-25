import { prisma } from "@/lib/prisma";
import type { ServiceKind } from "@prisma/client";
import type { SpecialistKind } from "@/lib/supabase/database.types";

export function specialistKindToPrisma(kind: SpecialistKind): ServiceKind {
  return kind === "groomer" ? "GROOMING" : "VETERINARY";
}

export async function ensureServiceProviderForUser(userId: string) {
  const existing = await prisma.serviceProvider.findFirst({
    where: { userId },
  });
  if (existing) return existing;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true, city: true },
  });
  if (!user) return null;

  return prisma.serviceProvider.create({
    data: {
      userId,
      name: user.displayName ?? "Специалист",
      kind: "VETERINARY",
      city: user.city ?? "Не указан",
      address: "Укажите адрес в кабинете",
      priceFrom: 1000,
      specialties: ["Приём"],
      verified: false,
    },
  });
}

export async function getServiceProviderForUser(userId: string) {
  return prisma.serviceProvider.findFirst({
    where: { userId },
    include: { media: true },
  });
}
