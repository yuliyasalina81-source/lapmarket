/**
 * Константы навигации: пункты основного меню и нижней панели на мобильных.
 * Содержит href, подписи и иконки Lucide для шапки и tab bar.
 */
import {
  Home,
  Newspaper,
  PawPrint,
  ShoppingBag,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from "lucide-react";

/** Элемент навигации с ссылкой, подписью и иконкой. */
export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Основные разделы (без главной — она в логотипе на десктопе). */
export const appNav: NavItem[] = [
  { href: "/pets", label: "Паспорт", icon: Syringe },
  { href: "/feed", label: "Лента", icon: Newspaper },
  { href: "/market", label: "Маркет", icon: ShoppingBag },
  { href: "/services", label: "Услуги", icon: Stethoscope },
];

/** Вкладки нижней панели на мобильных. */
export const mobileNav: NavItem[] = [
  { href: "/", label: "Главная", icon: Home },
  ...appNav,
];
