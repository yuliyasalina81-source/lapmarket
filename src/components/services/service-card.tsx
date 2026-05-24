"use client";

import Link from "next/link";
import { formatPrice, formatRating } from "@/lib/format";
import { SERVICE_KIND_LABELS } from "@/lib/constants";
import { ProductImage } from "@/components/ui/product-image";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { CatalogSpecialist } from "@/lib/services/catalog-types";

export function ServiceCard({
  service,
  onBook,
}: {
  service: CatalogSpecialist;
  onBook: (service: CatalogSpecialist) => void;
}) {
  const imageUrl = service.media?.url ?? null;

  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="flex flex-col gap-4 rounded-2xl border border-white/80 bg-white p-5 shadow-sm shadow-stone-900/5 sm:flex-row"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl sm:h-24 sm:w-24">
        <ProductImage src={imageUrl} alt={service.name} fill />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-800">
            {SERVICE_KIND_LABELS[service.kind]}
          </span>
          {service.verified && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              Лицензия проверена
            </span>
          )}
        </div>
        <Link href={`/services/${service.id}`}>
          <h3 className="mt-2 text-lg font-semibold text-stone-900 hover:text-emerald-700">
            {service.name}
          </h3>
        </Link>
        <p className="flex items-center gap-1 text-sm text-stone-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {service.city}, {service.address}
        </p>
        <p className="mt-2 text-sm text-stone-600">{service.specialties.join(" · ")}</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1 text-sm text-stone-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
            {formatRating(service.rating)} ({service.reviewCount} отзывов)
          </span>
          <span className="text-sm font-bold text-emerald-700">
            от {formatPrice(service.priceFrom)}
          </span>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => onBook(service)}
          className="mt-4 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Записаться
        </motion.button>
      </div>
    </motion.article>
  );
}
