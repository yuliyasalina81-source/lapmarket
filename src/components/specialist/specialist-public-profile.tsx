/** Server Component */
/** Публичный профиль специалиста с услугами и формой записи */

import Link from "next/link";
import { SERVICE_KIND_LABELS } from "@/lib/constants";
import { formatPrice, formatRating } from "@/lib/format";
import type { CatalogService } from "@/lib/services/catalog-types";
import type { ServiceKind } from "@prisma/client";
import { ProductImage } from "@/components/ui/product-image";
import { BookingForm } from "@/components/services/booking-form";
import { BadgeCheck, Star } from "lucide-react";

export function SpecialistPublicProfile({
  provider,
  services,
  useSupabase,
  pets,
  defaultPetId,
  backHref = "/services",
}: {
  provider: {
    id: string;
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
  };
  services: CatalogService[];
  useSupabase: boolean;
  pets?: { id: string; name: string }[];
  defaultPetId?: string;
  backHref?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href={backHref} className="text-sm text-emerald-700 hover:underline">
        ← Назад к услугам
      </Link>
      <div className="mt-6 overflow-hidden rounded-3xl border border-white/80 bg-white shadow-lg">
        <div className="relative h-48">
          <ProductImage src={provider.media?.url ?? null} alt={provider.name} fill />
        </div>
        <div className="p-6">
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
            {SERVICE_KIND_LABELS[provider.kind]}
          </span>
          {provider.verified && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
              <BadgeCheck className="h-3.5 w-3.5" />
              Проверено
            </span>
          )}
          <h1 className="mt-4 text-2xl font-bold text-stone-900">{provider.name}</h1>
          <p className="mt-2 text-stone-600">
            {provider.city}, {provider.address}
          </p>
          {provider.about && (
            <p className="mt-3 text-sm text-stone-600">{provider.about}</p>
          )}
          <p className="mt-2 text-sm text-stone-600">{provider.specialties.join(" · ")}</p>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {formatRating(provider.rating)} ({provider.reviewCount})
            </span>
            <span className="font-bold text-emerald-700">
              от {formatPrice(provider.priceFrom)}
            </span>
          </div>

          {services.length > 0 && (
            <div className="mt-6 border-t border-stone-100 pt-6">
              <h2 className="text-lg font-semibold text-stone-900">Услуги</h2>
              <ul className="mt-3 space-y-2">
                {services.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border border-stone-100 p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-stone-900">{s.name}</p>
                      {s.description && (
                        <p className="text-xs text-stone-500">{s.description}</p>
                      )}
                    </div>
                    <span className="text-emerald-700">
                      {formatPrice(s.price)} · {s.durationMinutes} мин
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <BookingForm
            specialistId={provider.id}
            providerName={provider.name}
            services={services}
            useSupabase={useSupabase}
            pets={pets}
            defaultPetId={defaultPetId}
          />
        </div>
      </div>
    </div>
  );
}
