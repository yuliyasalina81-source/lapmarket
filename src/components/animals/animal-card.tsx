"use client";

/** Client Component */
/** Карточка объявления в списке животных */

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { getListingMainImage } from "@/lib/queries/animals";
import { AnimalBadge, PassportIcon } from "./animal-badge";
import { ProductImage } from "@/components/ui/product-image";
import { motion } from "framer-motion";
import { Heart, MapPin } from "lucide-react";
import type { ListingWithRelations } from "@/lib/queries/animals";

/**
 * Карточка объявления с фото, ценой и кнопкой связи
 */
export function AnimalCard({
  listing,
  onContact,
}: {
  listing: ListingWithRelations;
  onContact?: (listing: ListingWithRelations) => void;
}) {
  const imageUrl = getListingMainImage(listing);
  const isPedigree = listing.badges.includes("PEDIGREE");
  const isGoodHands = listing.badges.includes("GOOD_HANDS");
  const buyLabel =
    listing.kind === "CAT" ? "Купить котёнка" : "Купить щенка";

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm shadow-stone-900/5"
    >
      <Link href={`/animals/${listing.id}`} className="relative block h-44">
        <ProductImage src={imageUrl} alt={listing.name} fill />
        {isPedigree && (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
            <span className="text-sm font-bold">✓</span>
          </span>
        )}
        {isGoodHands && (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
            <Heart className="h-4 w-4 fill-white" />
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {listing.badges.map((b) => (
            <AnimalBadge key={b} type={b} />
          ))}
          {isPedigree && <PassportIcon />}
        </div>
        <div>
          <Link href={`/animals/${listing.id}`}>
            <h3 className="text-lg font-semibold text-stone-900 hover:text-emerald-700">
              {listing.name}
            </h3>
          </Link>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-stone-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {listing.breed ?? "Метис"} · {listing.age} · {listing.city}
          </p>
        </div>
        <p className="line-clamp-2 text-sm text-stone-600">{listing.description}</p>
        <div className="mt-auto space-y-3 pt-2">
          {isPedigree && listing.price && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
              <p className="text-xs font-medium text-emerald-800">Покупка с документами</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">
                {formatPrice(listing.price)}
              </p>
              <Link
                href={`/animals/${listing.id}`}
                className="mt-3 block w-full rounded-xl bg-emerald-500 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-600"
              >
                {buyLabel}
              </Link>
            </div>
          )}
          {isGoodHands ? (
            <>
              <span className="text-lg font-bold text-red-500">В добрые руки</span>
              <button
                type="button"
                onClick={() => onContact?.(listing)}
                className="w-full rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
              >
                Забрать / Связаться
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onContact?.(listing)}
              className="w-full rounded-xl border-2 border-emerald-500 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Связаться
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
