"use client";

import type { AnimalListing } from "@/types";
import { formatPrice } from "@/lib/format";
import { AnimalBadge, PassportIcon } from "./animal-badge";
import { motion } from "framer-motion";
import { Heart, MapPin } from "lucide-react";

interface AnimalCardProps {
  animal: AnimalListing;
  onBuy?: (animal: AnimalListing) => void;
  onContact?: (animal: AnimalListing) => void;
}

export function AnimalCard({ animal, onBuy, onContact }: AnimalCardProps) {
  const isPedigree = animal.badges.includes("pedigree");
  const isGoodHands = animal.badges.includes("goodHands");
  const buyLabel =
    animal.kind === "cat" ? "Купить котёнка" : "Купить щенка";

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm shadow-stone-900/5"
    >
      <div
        className={`relative flex h-44 items-center justify-center text-6xl ${
          isGoodHands
            ? "bg-gradient-to-br from-red-50 via-white to-rose-50"
            : "bg-gradient-to-br from-emerald-50 via-white to-violet-50"
        }`}
      >
        {animal.image}
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
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {animal.badges.map((b) => (
            <AnimalBadge key={b} type={b} />
          ))}
          {isPedigree && <PassportIcon />}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-stone-900">{animal.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-stone-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {animal.breed ?? "Метис"} · {animal.age} · {animal.city}
          </p>
        </div>
        <p className="line-clamp-2 text-sm text-stone-600">{animal.description}</p>
        <div className="mt-auto space-y-3 pt-2">
          {isPedigree && animal.price && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
              <p className="text-xs font-medium text-emerald-800">
                Покупка с документами
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">
                {formatPrice(animal.price)}
              </p>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => onBuy?.(animal)}
                className="mt-3 w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-600"
              >
                {buyLabel}
              </motion.button>
            </div>
          )}
          {isGoodHands ? (
            <>
              <span className="text-lg font-bold text-red-500">В добрые руки</span>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => onContact?.(animal)}
                className="w-full rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/25 hover:bg-red-600"
              >
                Забрать / Связаться
              </motion.button>
            </>
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => onContact?.(animal)}
              className="w-full rounded-xl border-2 border-emerald-500 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Связаться
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
