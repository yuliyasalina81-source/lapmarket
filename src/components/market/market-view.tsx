"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import {
  getCertifiedProducts,
  productCategories,
} from "@/lib/mock-data";
import type { ProductCategory } from "@/types";
import { ProductCard } from "./product-card";
import { StaggerGrid, StaggerItem } from "@/components/ui/stagger-grid";
import { SkeletonGrid } from "@/components/ui/skeleton";

export function MarketView() {
  const [category, setCategory] = useState<ProductCategory | "Все">("Все");
  const [loading, setLoading] = useState(false);

  const products = useMemo(() => {
    const all = getCertifiedProducts();
    if (category === "Все") return all;
    return all.filter((p) => p.category === category);
  }, [category]);

  const changeCategory = (cat: ProductCategory | "Все") => {
    setLoading(true);
    setCategory(cat);
    setTimeout(() => setLoading(false), 400);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Товары
          </h1>
          <p className="mt-2 text-stone-600">
            Только сертифицированные продавцы — обычные темники не могут
            выкладывать товары
          </p>
        </div>
        <p className="flex items-center gap-2 self-start rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-2.5 text-sm font-medium text-emerald-800">
          <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden />
          Проверка продавца обязательна
        </p>
      </motion.div>

      <div className="mt-8 flex flex-wrap gap-2">
        <FilterPill
          active={category === "Все"}
          onClick={() => changeCategory("Все")}
          label="Все"
        />
        {productCategories.map((cat) => (
          <FilterPill
            key={cat}
            active={category === cat}
            onClick={() => changeCategory(cat)}
            label={cat}
          />
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <SkeletonGrid count={6} />
        ) : (
          <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
        {!loading && products.length === 0 && (
          <p className="py-12 text-center text-stone-500">
            В этой категории пока нет товаров
          </p>
        )}
      </div>
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
          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
          : "bg-white/80 text-stone-600 ring-1 ring-stone-200/80 hover:bg-emerald-50 hover:text-emerald-800"
      }`}
    >
      {label}
    </button>
  );
}
