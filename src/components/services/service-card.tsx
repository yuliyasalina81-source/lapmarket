"use client";

import type { ServiceProvider, ServiceKind } from "@/types";
import { formatPrice, formatRating } from "@/lib/format";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";

const kindLabels: Record<ServiceKind, string> = {
  veterinary: "Ветеринар",
  grooming: "Грумер",
  training: "Дрессировка",
  boarding: "Передержка",
  other: "Услуга",
};

export function ServiceCard({
  service,
  onBook,
}: {
  service: ServiceProvider;
  onBook: (service: ServiceProvider) => void;
}) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="flex flex-col gap-4 rounded-2xl border border-white/80 bg-white p-5 shadow-sm shadow-stone-900/5 sm:flex-row"
    >
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-violet-50 text-4xl sm:h-24 sm:w-24">
        {service.image}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-800">
            {kindLabels[service.kind]}
          </span>
          {service.verified && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              Лицензия проверена
            </span>
          )}
        </div>
        <h3 className="mt-2 text-lg font-semibold text-stone-900">
          {service.name}
        </h3>
        <p className="flex items-center gap-1 text-sm text-stone-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {service.city}, {service.address}
        </p>
        <p className="mt-2 text-sm text-stone-600">
          {service.specialties.join(" · ")}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1 text-sm text-stone-600">
            <Star
              className="h-4 w-4 fill-amber-400 text-amber-400"
              aria-hidden
            />
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
          className="mt-4 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:bg-emerald-600"
        >
          Записаться
        </motion.button>
      </div>
    </motion.article>
  );
}
