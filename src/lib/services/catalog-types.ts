/**
 * Типы каталога услуг и маппинг kind между Supabase и Prisma ServiceKind.
 */
import type { ServiceKind } from "@prisma/client";
import type { SpecialistKind } from "@/lib/supabase/database.types";

/** Услуга специалиста в каталоге. */
export type CatalogService = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string | null;
};

/** Специалист с услугами для страницы каталога. */
export type CatalogSpecialist = {
  id: string;
  userId: string;
  name: string;
  kind: ServiceKind;
  city: string;
  address: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  specialties: string[];
  verified: boolean;
  about: string | null;
  media: { url: string | null } | null;
  services: CatalogService[];
};

/**
 * vet → VETERINARY, groomer → GROOMING.
 * @param kind Тип специалиста в Supabase
 * @returns ServiceKind для Prisma/UI
 */
export function specialistKindToServiceKind(kind: SpecialistKind): ServiceKind {
  return kind === "vet" ? "VETERINARY" : "GROOMING";
}

/**
 * Обратный маппинг ServiceKind → SpecialistKind (только vet/groomer).
 * @param kind Тип услуги Prisma
 * @returns vet, groomer или null для прочих kind
 */
export function serviceKindToSpecialistKind(
  kind: ServiceKind
): SpecialistKind | null {
  if (kind === "VETERINARY") return "vet";
  if (kind === "GROOMING") return "groomer";
  return null;
}
