"use client";

/** Client Component */
/** Карта специалистов на странице услуг */

import { useState } from "react";
import { MapPin, List } from "lucide-react";
import type { CatalogSpecialist } from "@/lib/services/catalog-types";

/**
 * Интерактивная карта точек оказания услуг
 */
export function ServicesMap({
  providers,
}: {
  providers: CatalogSpecialist[];
}) {
  const [showMap, setShowMap] = useState(false);

  if (providers.length === 0) return null;

  const points = providers
    .map((p) => `${p.city}, ${p.address}`)
    .join("~");
  const mapSrc = `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(points)}&z=11`;

  return (
    <div className="mt-6">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowMap(false)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium ${
            !showMap
              ? "bg-emerald-600 text-white"
              : "bg-stone-100 text-stone-600"
          }`}
        >
          <List className="h-4 w-4" />
          Список
        </button>
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium ${
            showMap
              ? "bg-emerald-600 text-white"
              : "bg-stone-100 text-stone-600"
          }`}
        >
          <MapPin className="h-4 w-4" />
          На карте
        </button>
      </div>
      {showMap && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
          <iframe
            title="Карта специалистов"
            src={mapSrc}
            className="h-80 w-full border-0"
            loading="lazy"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
