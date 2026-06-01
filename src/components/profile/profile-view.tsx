"use client";



/** Client Component */
/** Личный кабинет: профиль, заказы, питомцы */

import { motion } from "framer-motion";

import Link from "next/link";

import {

  PawPrint,

  Heart,

  ShoppingBag,

  Calendar,

  Settings,

  BadgeCheck,

  Store,

  Building2,

  Shield,

  Package,

  Syringe,

  Inbox,

  Bell,

} from "lucide-react";

import type { UserRole } from "@prisma/client";

import { roleLabels } from "@/lib/roles";

import { AvatarDisplay } from "@/components/ui/avatar-display";



export type ProfileUser = {

  id: string;

  displayName: string;

  email: string;

  avatar: string;

  city: string | null;

  role: UserRole;

  pets: { id: string; name: string; kind: string }[];

  sellerProfile?: {

    shopName: string;

    description: string;

    tier: string;

  } | null;

  shelterProfile?: {

    organizationName: string;

    description: string;

    city: string;

  } | null;

};



/**
 * Главная страница профиля с вкладками
 */
export function ProfileView({

  user,

  stats,

  reminders,

  hasProvider,

}: {

  user: ProfileUser;

  stats: { postCount: number; listingCount: number; bookingCount: number };

  reminders: { id: string; title: string; dueAt: Date; pet: { name: string } }[];

  hasProvider: boolean;

}) {

  const statItems = [
    {
      label: "Постов",
      value: stats.postCount,
      href: `/users/${user.id}`,
    },
    { label: "Питомцев", value: user.pets.length },
    { label: "Записей", value: stats.bookingCount },
  ];



  const roleLinks = [

    { href: "/pets", icon: Syringe, label: "Паспорт питомца" },

    { href: "/feed", icon: Heart, label: "Лента" },

    { href: "/dashboard/client", icon: Calendar, label: "Мои записи" },

    { href: "/settings", icon: Settings, label: "Настройки аккаунта" },

  ];



  if (user.role === "SELLER" || user.role === "SHELTER") {

    roleLinks.push({ href: "/profile/inbox", icon: Inbox, label: "Входящие запросы" });

  }

  if (user.role === "SPECIALIST") {
    roleLinks.push({
      href: "/dashboard/specialist",
      icon: Calendar,
      label: "Кабинет специалиста",
    });
  }

  if (hasProvider) {

    roleLinks.push({

      href: "/profile/provider-bookings",

      icon: Calendar,

      label: "Записи клиентов",

    });

  }

  if (user.role === "SELLER") {

    roleLinks.splice(2, 0, {

      href: "/seller/products",

      icon: Package,

      label: "Мои товары",

    });

    roleLinks.push({

      href: "/seller/orders",

      icon: ShoppingBag,

      label: "Запросы покупателей",

    });

  }

  if (user.role === "OWNER") {

    roleLinks.push({

      href: "/profile/orders",

      icon: ShoppingBag,

      label: "Мои запросы в магазин",

    });

  }

  if (user.role === "SELLER" || user.role === "SHELTER") {

    roleLinks.splice(2, 0, {

      href: "/listings/new",

      icon: BadgeCheck,

      label: "Новое объявление",

    });

  }

  if (user.role === "ADMIN") {

    roleLinks.unshift({

      href: "/admin",

      icon: Shield,

      label: "Админ-панель",

    });

  }



  return (

    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

      <motion.div

        initial={{ opacity: 0, y: 16 }}

        animate={{ opacity: 1, y: 0 }}

        className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-lg shadow-emerald-900/5"

      >

        <div className="h-28 bg-gradient-to-r from-emerald-500 via-emerald-400 to-violet-400" />

        <div className="relative px-6 pb-6">

          <div className="absolute -top-12 overflow-hidden rounded-3xl border-4 border-white shadow-lg">

            <AvatarDisplay avatar={user.avatar} name={user.displayName} size={96} />

          </div>

          <div className="pt-14">

            <div className="flex flex-wrap items-center gap-2">

              <h1 className="text-2xl font-bold text-stone-900">{user.displayName}</h1>

              <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-medium text-emerald-800">

                {roleLabels[user.role]}

              </span>

            </div>

            <p className="text-sm text-stone-500">

              {user.city ? `${user.city} · ` : ""}

              {user.email}

            </p>



            {user.sellerProfile && (

              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">

                <Store className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                <div>

                  <p className="font-medium">{user.sellerProfile.shopName}</p>

                  <p className="text-stone-500">{user.sellerProfile.description}</p>

                </div>

              </div>

            )}



            {user.shelterProfile && (

              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">

                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                <div>

                  <p className="font-medium">{user.shelterProfile.organizationName}</p>

                  <p className="text-stone-500">

                    {user.shelterProfile.city} — {user.shelterProfile.description}

                  </p>

                </div>

              </div>

            )}

          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-stone-100 pt-6">

            {statItems.map((s) => (
              <div key={s.label} className="text-center">
                {"href" in s && s.href ? (
                  <Link href={s.href} className="block hover:opacity-80">
                    <p className="text-2xl font-bold text-emerald-700">{s.value}</p>
                    <p className="text-xs text-stone-500">{s.label}</p>
                  </Link>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-emerald-700">{s.value}</p>
                    <p className="text-xs text-stone-500">{s.label}</p>
                  </>
                )}
              </div>
            ))}

          </div>

        </div>

      </motion.div>



      {user.role === "OWNER" && (

        <section className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">

          <div className="flex items-center justify-between">

            <h2 className="font-semibold text-stone-900">Мои питомцы</h2>

            <Link href="/pets/new" className="text-sm font-semibold text-emerald-700 hover:underline">

              + Добавить

            </Link>

          </div>

          {user.pets.length > 0 ? (

            <div className="mt-3 flex flex-wrap gap-2">

              {user.pets.map((pet) => (

                <Link

                  key={pet.id}

                  href={`/pets/${pet.id}`}

                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-medium text-emerald-800 shadow-sm"

                >

                  <PawPrint className="h-3.5 w-3.5" />

                  {pet.name}

                </Link>

              ))}

            </div>

          ) : (

            <p className="mt-2 text-sm text-stone-600">

              <Link href="/pets/new" className="font-semibold text-emerald-700 hover:underline">

                Создайте паспорт питомца

              </Link>

            </p>

          )}

          {reminders.length > 0 && (

            <div className="mt-4">

              <p className="flex items-center gap-1 text-xs font-semibold uppercase text-stone-500">

                <Bell className="h-3.5 w-3.5" />

                Ближайшие напоминания

              </p>

              <ul className="mt-2 space-y-1">

                {reminders.map((r) => (

                  <li key={r.id} className="text-sm text-stone-700">

                    {r.pet.name}: {r.title} —{" "}

                    {r.dueAt.toLocaleDateString("ru-RU")}

                  </li>

                ))}

              </ul>

            </div>

          )}

          <div className="mt-4 flex flex-wrap gap-3 text-sm">

            <Link href="/services" className="font-semibold text-emerald-700 hover:underline">

              Записаться к ветеринару →

            </Link>

          </div>

        </section>

      )}



      <ul className="mt-8 space-y-2">

        {roleLinks.map(({ href, icon: Icon, label }) => (

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

          <Link

            href="/market"

            className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-4 py-4 text-stone-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/50"

          >

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

              <ShoppingBag className="h-5 w-5" />

            </span>

            <span className="font-medium">Каталог товаров</span>

          </Link>

        </li>

      </ul>

    </div>

  );

}

