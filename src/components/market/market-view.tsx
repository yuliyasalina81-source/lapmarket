"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { PRODUCT_CATEGORY_LABELS, PRODUCT_CATEGORIES } from "@/lib/constants";
import type { ProductCategory } from "@prisma/client";
import { ProductCard } from "./product-card";
import { StaggerGrid, StaggerItem } from "@/components/ui/stagger-grid";
import type { getPublishedProducts } from "@/lib/queries/products";

type ProductItem = Awaited<ReturnType<typeof getPublishedProducts>>[number];

export function MarketView({ products }: { products: ProductItem[] }) {
  const [category, setCategory] = useState<ProductCategory | "ALL">("ALL");

  const filtered = useMemo(() => {
    if (category === "ALL") return products;
    return products.filter((p) => p.category === category);
  }, [products, category]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">Товары</h1>
          <p className="mt-2 text-stone-600">
            Только сертифицированные продавцы — обычные темники не могут выкладывать товары
          </p>
        </div>
        <p className="flex items-center gap-2 self-start rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-2.5 text-sm font-medium text-emerald-800">
          <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden />
          Проверка продавца обязательна
        </p>
      </motion.div>

      <div className="mt-8 flex flex-wrap gap-2">
        <FilterPill active={category === "ALL"} onClick={() => setCategory("ALL")} label="Все" />
        {PRODUCT_CATEGORIES.map((cat) => (
          <FilterPill
            key={cat}
            active={category === cat}
            onClick={() => setCategory(cat)}
            label={PRODUCT_CATEGORY_LABELS[cat]}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-stone-500">Товаров в этой категории пока нет</p>
      ) : (
        <StaggerGrid className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
          : "bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-emerald-300"
      }`}
    >
      {label}
    </button>
  );
}
