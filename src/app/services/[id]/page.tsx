import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSpecialistById } from "@/lib/queries/services-supabase";
import { getUserPets } from "@/lib/queries/pets";
import { SERVICE_KIND_LABELS } from "@/lib/constants";
import { formatPrice, formatRating } from "@/lib/format";
import { ProductImage } from "@/components/ui/product-image";
import { BookingForm } from "@/components/services/booking-form";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { BadgeCheck, Star } from "lucide-react";

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ petId?: string }>;
}) {
  const { id } = await params;
  const { petId } = await searchParams;
  const session = await auth();
  const service = await getSpecialistById(id);
  if (!service) notFound();

  const pets = session?.user?.id
    ? await getUserPets(session.user.id)
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/services" className="text-sm text-emerald-700 hover:underline">
        ← Назад к услугам
      </Link>
      <div className="mt-6 overflow-hidden rounded-3xl border border-white/80 bg-white shadow-lg">
        <div className="relative h-48">
          <ProductImage src={service.media?.url ?? null} alt={service.name} fill />
        </div>
        <div className="p-6">
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
            {SERVICE_KIND_LABELS[service.kind]}
          </span>
          {service.verified && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
              <BadgeCheck className="h-3.5 w-3.5" />
              Проверено
            </span>
          )}
          <h1 className="mt-4 text-2xl font-bold text-stone-900">{service.name}</h1>
          <p className="mt-2 text-stone-600">
            {service.city}, {service.address}
          </p>
          {service.about && (
            <p className="mt-3 text-sm text-stone-600">{service.about}</p>
          )}
          <p className="mt-2 text-sm text-stone-600">{service.specialties.join(" · ")}</p>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {formatRating(service.rating)} ({service.reviewCount})
            </span>
            <span className="font-bold text-emerald-700">
              от {formatPrice(service.priceFrom)}
            </span>
          </div>
          <BookingForm
            specialistId={service.id}
            providerName={service.name}
            services={service.services}
            useSupabase={isSupabaseConfigured()}
            pets={pets.map((p) => ({ id: p.id, name: p.name }))}
            defaultPetId={petId}
          />
        </div>
      </div>
    </div>
  );
}
