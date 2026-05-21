"use client";

import type { Product } from "@/types";
import { formatPrice, formatRating } from "@/lib/format";
import { getSeller } from "@/lib/mock-data";
import { ShieldCheck, Star, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export function ProductCard({ product }: { product: Product }) {
  const seller = getSeller(product.sellerId);

  const buy = () => {
    alert(
      `Оплата (демо)\n\n${product.title}\n${formatPrice(product.price)}\n\nСкоро — реальная корзина и оплата.`
    );
  };

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm shadow-stone-900/5"
    >
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-amber-50 via-white to-emerald-50 text-5xl">
        {product.image}
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Сертифицировано
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          {product.category}
        </span>
        <h3 className="font-semibold leading-snug text-stone-900">
          {product.title}
        </h3>
        <div className="flex items-center gap-1 text-sm text-stone-500">
          <Star
            className="h-4 w-4 fill-amber-400 text-amber-400"
            aria-hidden
          />
          {formatRating(product.rating)}
        </div>
        {seller && (
          <p className="truncate text-xs text-stone-500">{seller.name}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-xl font-bold text-emerald-700">
            {formatPrice(product.price)}
          </span>
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={buy}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition hover:bg-emerald-600"
          >
            <ShoppingBag className="h-4 w-4" />
            Купить
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
