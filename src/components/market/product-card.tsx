"use client";

import Link from "next/link";
import { formatPrice, formatRating } from "@/lib/format";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import { getProductMainImage } from "@/lib/queries/products";
import { ProductImage } from "@/components/ui/product-image";
import { ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { getPublishedProducts } from "@/lib/queries/products";

type ProductItem = Awaited<ReturnType<typeof getPublishedProducts>>[number];

export function ProductCard({ product }: { product: ProductItem }) {
  const imageUrl = getProductMainImage(product);
  const shopName = product.seller.sellerProfile?.shopName;

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm shadow-stone-900/5"
    >
      <Link href={`/market/${product.id}`} className="relative block h-40">
        <ProductImage src={imageUrl} alt={product.title} fill className="rounded-t-2xl" />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Сертифицировано
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          {PRODUCT_CATEGORY_LABELS[product.category]}
        </span>
        <Link href={`/market/${product.id}`}>
          <h3 className="font-semibold leading-snug text-stone-900 hover:text-emerald-700">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 text-sm text-stone-500">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
          {formatRating(product.rating)}
        </div>
        {shopName && <p className="truncate text-xs text-stone-500">{shopName}</p>}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-xl font-bold text-emerald-700">
            {formatPrice(product.price)}
          </span>
          <Link
            href={`/market/${product.id}`}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition hover:bg-emerald-600"
          >
            Подробнее
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
