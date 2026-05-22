"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, Loader2 } from "lucide-react";
import { registerUser, type RegisterState } from "@/actions/auth";

const initial: RegisterState = {};

type Role = "OWNER" | "SELLER" | "SHELTER";

const roles: { value: Role; label: string; desc: string }[] = [
  { value: "OWNER", label: "Владелец", desc: "Питомцы, лента, покупки" },
  { value: "SELLER", label: "Продавец", desc: "Товары для животных" },
  { value: "SHELTER", label: "Приют", desc: "Животные в добрые руки" },
];

export function RegisterForm() {
  const [role, setRole] = useState<Role>("OWNER");
  const [state, action, pending] = useActionState(registerUser, initial);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-lg"
    >
      <div className="rounded-3xl border border-white/80 bg-white p-8 shadow-lg shadow-emerald-900/5">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
            <PawPrint className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Регистрация</h1>
            <p className="text-sm text-stone-500">Создайте аккаунт ЛапМаркет</p>
          </div>
        </div>

        {state.error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <form action={action} className="space-y-4">
          <input type="hidden" name="role" value={role} />

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-stone-700">
              Тип аккаунта
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                    role === r.value
                      ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                      : "border-stone-200 bg-white text-stone-700 hover:border-emerald-200"
                  }`}
                >
                  <span className="font-semibold">{r.label}</span>
                  <span className="mt-0.5 block text-xs text-stone-500">
                    {r.desc}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="displayName"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              {role === "SELLER"
                ? "Контактное имя"
                : role === "SHELTER"
                  ? "Контактное лицо"
                  : "Имя"}
            </label>
            <input
              id="displayName"
              name="displayName"
              required
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            {state.fieldErrors?.displayName && (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.displayName[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            {state.fieldErrors?.email && (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-stone-700"
            >
              Пароль (мин. 8 символов)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            {state.fieldErrors?.password && (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>

          <AnimatePresence mode="wait">
            {role === "OWNER" && (
              <motion.div
                key="owner"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label
                    htmlFor="city"
                    className="mb-1.5 block text-sm font-medium text-stone-700"
                  >
                    Город
                  </label>
                  <input
                    id="city"
                    name="city"
                    placeholder="Москва"
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="pets"
                    className="mb-1.5 block text-sm font-medium text-stone-700"
                  >
                    Питомцы (через запятую)
                  </label>
                  <input
                    id="pets"
                    name="pets"
                    placeholder="Боня, Марс"
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </motion.div>
            )}

            {role === "SELLER" && (
              <motion.div
                key="seller"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label
                    htmlFor="shopName"
                    className="mb-1.5 block text-sm font-medium text-stone-700"
                  >
                    Название магазина
                  </label>
                  <input
                    id="shopName"
                    name="shopName"
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                  {state.fieldErrors?.shopName && (
                    <p className="mt-1 text-xs text-red-600">
                      {state.fieldErrors.shopName[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="shopDescription"
                    className="mb-1.5 block text-sm font-medium text-stone-700"
                  >
                    Описание
                  </label>
                  <textarea
                    id="shopDescription"
                    name="shopDescription"
                    rows={3}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                  {state.fieldErrors?.shopDescription && (
                    <p className="mt-1 text-xs text-red-600">
                      {state.fieldErrors.shopDescription[0]}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {role === "SHELTER" && (
              <motion.div
                key="shelter"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <div>
                  <label
                    htmlFor="organizationName"
                    className="mb-1.5 block text-sm font-medium text-stone-700"
                  >
                    Название приюта / питомника
                  </label>
                  <input
                    id="organizationName"
                    name="organizationName"
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                  {state.fieldErrors?.organizationName && (
                    <p className="mt-1 text-xs text-red-600">
                      {state.fieldErrors.organizationName[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="shelterCity"
                    className="mb-1.5 block text-sm font-medium text-stone-700"
                  >
                    Город
                  </label>
                  <input
                    id="shelterCity"
                    name="shelterCity"
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                  {state.fieldErrors?.shelterCity && (
                    <p className="mt-1 text-xs text-red-600">
                      {state.fieldErrors.shelterCity[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="shelterDescription"
                    className="mb-1.5 block text-sm font-medium text-stone-700"
                  >
                    Описание
                  </label>
                  <textarea
                    id="shelterDescription"
                    name="shelterDescription"
                    rows={3}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                  {state.fieldErrors?.shelterDescription && (
                    <p className="mt-1 text-xs text-red-600">
                      {state.fieldErrors.shelterDescription[0]}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Создать аккаунт
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Уже есть аккаунт?{" "}
          <Link
            href="/login"
            className="font-medium text-emerald-700 hover:underline"
          >
            Войти
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
