import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingById } from "@/lib/queries/animals";
import { getListingMainImage } from "@/lib/queries/animals";
import { AnimalBadge, PassportIcon } from "@/components/animals/animal-badge";
import { ProductImage } from "@/components/ui/product-image";
import { formatPrice } from "@/lib/format";
import { ContactForm } from "@/components/animals/contact-form";

export default async function AnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing || listing.status !== "PUBLISHED") notFound();

  const mainImage = getListingMainImage(listing);
  const isPedigree = listing.badges.includes("PEDIGREE");
  const isGoodHands = listing.badges.includes("GOOD_HANDS");
  const authorName =
    listing.author.sellerProfile?.shopName ??
    listing.author.shelterProfile?.organizationName ??
    listing.author.displayName;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/animals" className="text-sm text-emerald-700 hover:underline">
        ← Назад к объявлениям
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {listing.images.length > 0 ? (
            listing.images.map((img) => (
              <div key={img.id} className="relative h-64 overflow-hidden rounded-2xl">
                <ProductImage src={img.media.url} alt={listing.name} fill />
              </div>
            ))
          ) : (
            <div className="relative h-64 overflow-hidden rounded-2xl">
              <ProductImage src={mainImage} alt={listing.name} fill />
            </div>
          )}
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            {listing.badges.map((b) => (
              <AnimalBadge key={b} type={b} />
            ))}
            {isPedigree && <PassportIcon />}
          </div>
          <h1 className="mt-4 text-3xl font-bold text-stone-900">{listing.name}</h1>
          <p className="mt-2 text-stone-600">
            {listing.breed ?? "Метис"} · {listing.age} · {listing.city}
          </p>
          {isPedigree && listing.price && (
            <p className="mt-4 text-3xl font-bold text-emerald-700">
              {formatPrice(listing.price)}
            </p>
          )}
          {isGoodHands && (
            <p className="mt-4 text-2xl font-bold text-red-500">В добрые руки</p>
          )}
          <p className="mt-6 leading-relaxed text-stone-700">{listing.description}</p>
          <p className="mt-4 text-sm text-stone-500">Продавец: {authorName}</p>
          <ContactForm listingId={listing.id} listingName={listing.name} />
        </div>
      </div>
    </div>
  );
}
