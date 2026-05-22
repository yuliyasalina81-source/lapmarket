"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PawPrint,
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { AvatarDisplay } from "@/components/ui/avatar-display";
import { isImageUrl } from "@/lib/constants";

const nav = [
  { href: "/pets", label: "Паспорт" },
  { href: "/feed", label: "Лента" },
  { href: "/market", label: "Товары" },
  { href: "/animals", label: "Объявления" },
  { href: "/services", label: "Услуги" },
  { href: "/profile", label: "Профиль" },
];

type NavbarClientProps = {
  notifications?: ReactNode;
};

export function NavbarClient({ notifications }: NavbarClientProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const isLoggedIn = status === "authenticated" && !!user;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/75 shadow-sm shadow-emerald-900/5 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-stone-900 transition hover:opacity-90"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30">
            <PawPrint className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg tracking-tight">
            Лап<span className="text-emerald-600">Маркет</span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Основное меню"
        >
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "text-emerald-700"
                    : "text-stone-600 hover:bg-emerald-50/80 hover:text-emerald-800"
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-emerald-50"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="hidden rounded-xl px-3 py-2 text-sm font-medium text-stone-600 hover:bg-emerald-50 sm:block"
          >
            Поиск
          </Link>
          {isLoggedIn && notifications && (
            <div className="hidden sm:block">{notifications}</div>
          )}

          {status === "loading" ? (
            <div className="hidden h-10 w-24 animate-pulse rounded-2xl bg-stone-100 sm:block" />
          ) : isLoggedIn ? (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded-2xl border border-stone-200/80 bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                {isImageUrl(user.avatar ?? "") ? (
                  <AvatarDisplay
                    avatar={user.avatar!}
                    name={user.displayName ?? ""}
                    size={32}
                    className="rounded-xl"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-emerald-50 text-lg">
                    {user.avatar}
                  </span>
                )}
                <span className="max-w-[100px] truncate text-sm font-medium text-stone-700">
                  {user.displayName}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-stone-400 transition ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-stone-100 bg-white py-1 shadow-xl shadow-stone-900/10"
                  >
                    <p className="border-b border-stone-50 px-4 py-3 text-xs text-stone-500">
                      {user.email}
                    </p>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-emerald-50"
                    >
                      <User className="h-4 w-4 text-emerald-600" />
                      Профиль
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                    >
                      <Settings className="h-4 w-4" />
                      Настройки
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Выйти
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/login"
                className="rounded-xl px-3.5 py-2 text-sm font-medium text-stone-600 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Регистрация
              </Link>
            </div>
          )}

          <button
            type="button"
            className="rounded-xl p-2 text-stone-600 transition hover:bg-emerald-50 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-stone-100 bg-white/95 md:hidden"
            aria-label="Мобильное меню"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`rounded-xl px-4 py-3 text-sm font-medium ${
                      active
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="mt-2 flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3"
                  >
                    <span className="text-xl">{user.avatar}</span>
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-stone-500">{user.city}</p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <div className="mt-2 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="rounded-xl border border-stone-200 px-4 py-3 text-center text-sm font-medium text-stone-700"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
