/** Server Component */
/** Бейджи и иконки статуса объявления о животном */

import { BadgeCheck, Heart, FileText } from "lucide-react";
import type { AnimalBadge as BadgeEnum } from "@prisma/client";

const config: Record<
  BadgeEnum,
  { label: string; icon: typeof BadgeCheck; className: string }
> = {
  PEDIGREE: {
    label: "С галочкой",
    icon: BadgeCheck,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  GOOD_HANDS: {
    label: "С сердечком",
    icon: Heart,
    className: "bg-red-50 text-red-600 border-red-200",
  },
};

/**
 * Бейдж «С галочкой» или «С сердечком» для объявления
 */
export function AnimalBadge({ type }: { type: BadgeEnum }) {
  const { label, icon: Icon, className } = config[type];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      <Icon className="h-3.5 w-3.5 fill-current" aria-hidden />
      {label}
    </span>
  );
}

/**
 * Иконка наличия паспорта питомца в объявлении
 */
export function PassportIcon() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700"
      title="Паспорт питомца"
    >
      <FileText className="h-3.5 w-3.5" aria-hidden />
      Паспорт
    </span>
  );
}
