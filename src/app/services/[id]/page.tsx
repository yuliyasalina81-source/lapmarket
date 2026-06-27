/** Server Component */
/** /services/[id] — профиль специалиста и форма записи */
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSpecialistById } from "@/lib/queries/services-supabase";
import { getUserPets } from "@/lib/queries/pets";
import { SpecialistPublicProfile } from "@/components/specialist/specialist-public-profile";
import { isSupabaseConfigured } from "@/lib/supabase/server";

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

  const pets = session?.user?.id ? await getUserPets(session.user.id) : [];
  const supabaseOk = isSupabaseConfigured();

  return (
    <SpecialistPublicProfile
      provider={{
        id: service.id,
        name: service.name,
        kind: service.kind,
        city: service.city,
        address: service.address,
        rating: service.rating,
        reviewCount: service.reviewCount,
        priceFrom: service.priceFrom,
        specialties: service.specialties,
        verified: service.verified,
        about: service.about,
        media: service.media,
      }}
      services={service.services}
      useSupabase={supabaseOk && service.services.length > 0}
      pets={pets.map((p) => ({ id: p.id, name: p.name }))}
      defaultPetId={petId}
    />
  );
}
