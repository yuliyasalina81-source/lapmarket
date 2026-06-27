/** Server Component */
/** /specialist/[id] — публичный профиль специалиста */
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getActiveServicesForProvider,
  getServiceProviderById,
  toCatalogService,
} from "@/lib/queries/services";
import { getUserPets } from "@/lib/queries/pets";
import { SpecialistPublicProfile } from "@/components/specialist/specialist-public-profile";

export default async function SpecialistPublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ petId?: string }>;
}) {
  const { id } = await params;
  const { petId } = await searchParams;
  const session = await auth();

  const provider = await getServiceProviderById(id);
  if (!provider) notFound();

  const services = await getActiveServicesForProvider(id);
  const pets = session?.user?.id ? await getUserPets(session.user.id) : [];

  return (
    <SpecialistPublicProfile
      provider={{
        id: provider.id,
        name: provider.name,
        kind: provider.kind,
        city: provider.city,
        address: provider.address,
        rating: provider.rating,
        reviewCount: provider.reviewCount,
        priceFrom: provider.priceFrom,
        specialties: provider.specialties,
        verified: provider.verified,
        about: null,
        media: provider.media ? { url: provider.media.url } : null,
      }}
      services={services.map(toCatalogService)}
      useSupabase={false}
      pets={pets.map((p) => ({ id: p.id, name: p.name }))}
      defaultPetId={petId}
    />
  );
}
