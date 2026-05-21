"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  PawPrint,
  Heart,
  ShoppingBag,
  Calendar,
  Settings,
  BadgeCheck,
} from "lucide-react";
import { currentUser } from "@/lib/mock-data";

const stats = [
  { label: "Постов", value: 12 },
  { label: "Питомцев", value: currentUser.pets.length },
  { label: "Заказов", value: 3 },
];

const links = [
  { href: "/feed", icon: Heart, label: "Моя лента" },
  { href: "/market", icon: ShoppingBag, label: "Мои покупки" },
  { href: "/services", icon: Calendar, label: "Мои записи" },
  { href: "/animals", icon: BadgeCheck, label: "Избранные питомцы" },
];

export function ProfileView() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-lg shadow-emerald-900/5"
      >
        <div className="h-28 bg-gradient-to-r from-emerald-500 via-emerald-400 to-violet-400" />
        <div className="relative px-6 pb-6">
          <span className="absolute -top-12 flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-amber-100 to-emerald-50 text-4xl shadow-lg">
            {currentUser.avatar}
          </span>
          <div className="pt-14">
            <h1 className="text-2xl font-bold text-stone-900">
              {currentUser.displayName}
            </h1>
            <p className="text-sm text-stone-500">
              {currentUser.city} · {currentUser.email}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {currentUser.pets.map((pet) => (
                <span
                  key={pet}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800"
                >
                  <PawPrint className="h-3.5 w-3.5" />
                  {pet}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-stone-100 pt-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-emerald-700">{s.value}</p>
                <p className="text-xs text-stone-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <ul className="mt-8 space-y-2">
        {links.map(({ href, icon: Icon, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-4 text-stone-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-800"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-medium">{label}</span>
            </Link>
          </li>
        ))}
        <li>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-4 text-stone-700 shadow-sm transition hover:bg-stone-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
              <Settings className="h-5 w-5" />
            </span>
            <span className="font-medium">Настройки аккаунта</span>
          </button>
        </li>
      </ul>

      <p className="mt-8 text-center text-xs text-stone-400">
        Профиль — демо-заглушка. Дальше: авторизация и редактирование.
      </p>
    </div>
  );
}
