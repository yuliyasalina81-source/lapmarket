"use client";

/** Client Component */
/** Каталог товаров с фильтрами и корзиной */

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ShieldCheck } from "lucide-react";
import { PRODUCT_CATEGORY_LABELS, PRODUCT_CATEGORIES } from "@/lib/constants";
import type { ProductCategory } from "@prisma/client";
import { ProductCard } from "./product-card";
import { StaggerGrid, StaggerItem } from "@/components/ui/stagger-grid";
import type { getPublishedProducts } from "@/lib/queries/products";

type ProductItem = Awaited<ReturnType<typeof getPublishedProducts>>[number];

type SellerOption = { id: string; displayName: string };

/**
 * Страница маркетплейса со списком товаров
 */
export function MarketView({
  products,
  sellers,
}: {
  products: ProductItem[];
  sellers: SellerOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const category = (searchParams.get("category") as ProductCategory | "ALL") || "ALL";
  const sellerId = searchParams.get("sellerId") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  const applyFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`/market?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ q });
  };

  const filtered = useMemo(() => products, [products]);

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

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по названию и описанию..."
            className="w-full rounded-xl border border-stone-200 py-2.5 pl-10 pr-4 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Найти
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <FilterPill
          active={category === "ALL"}
          onClick={() => applyFilters({ category: "" })}
          label="Все"
        />
        {PRODUCT_CATEGORIES.map((cat) => (
          <FilterPill
            key={cat}
            active={category === cat}
            onClick={() => applyFilters({ category: cat })}
            label={PRODUCT_CATEGORY_LABELS[cat]}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="number"
          placeholder="Цена от"
          value={minPrice}
          onChange={(e) => applyFilters({ minPrice: e.target.value })}
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Цена до"
          value={maxPrice}
          onChange={(e) => applyFilters({ maxPrice: e.target.value })}
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <select
          value={sellerId}
          onChange={(e) => applyFilters({ sellerId: e.target.value })}
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        >
          <option value="">Все продавцы</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.displayName}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => applyFilters({ sort: e.target.value })}
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        >
          <option value="newest">Сначала новые</option>
          <option value="price_asc">Цена ↑</option>
          <option value="price_desc">Цена ↓</option>
          <option value="rating">По рейтингу</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-stone-500">Товаров не найдено</p>
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

/**
 * Переключатель фильтра категории товаров
 */
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
          ? "bg-emerald-600 text-white shadow-md"
          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
      }`}
    >
      {label}
    </button>
  );
}
