import {
  Home,
  Newspaper,
  PawPrint,
  ShoppingBag,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Основные разделы (без главной — она в логотипе на десктопе). */
export const appNav: NavItem[] = [
  { href: "/feed", label: "Лента", icon: Newspaper },
  { href: "/market", label: "Маркет", icon: ShoppingBag },
  { href: "/animals", label: "Питомцы", icon: PawPrint },
  { href: "/services", label: "Услуги", icon: Stethoscope },
];

/** Вкладки нижней панели на мобильных. */
export const mobileNav: NavItem[] = [
  { href: "/", label: "Главная", icon: Home },
  ...appNav,
];
