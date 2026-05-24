import type { ServiceKind } from "@prisma/client";
import type { SpecialistKind } from "@/lib/supabase/database.types";

export type CatalogService = {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  description: string | null;
};

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

export function specialistKindToServiceKind(kind: SpecialistKind): ServiceKind {
  return kind === "vet" ? "VETERINARY" : "GROOMING";
}

export function serviceKindToSpecialistKind(
  kind: ServiceKind
): SpecialistKind | null {
  if (kind === "VETERINARY") return "vet";
  if (kind === "GROOMING") return "groomer";
  return null;
}
