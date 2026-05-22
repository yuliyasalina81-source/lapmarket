"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { PawPrint, Loader2 } from "lucide-react";
import { loginUser, type LoginState } from "@/actions/login";

const initial: LoginState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const [state, action, pending] = useActionState(loginUser, initial);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-md"
    >
      <div className="rounded-3xl border border-white/80 bg-white p-8 shadow-lg shadow-emerald-900/5">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
            <PawPrint className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Вход</h1>
            <p className="text-sm text-stone-500">ЛапМаркет</p>
          </div>
        </div>

        {registered && (
          <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Аккаунт создан. Войдите с email и паролем.
          </p>
        )}

        {state.error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <form action={action} className="space-y-4">
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
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
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
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            {state.fieldErrors?.password && (
              <p className="mt-1 text-xs text-red-600">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Войти
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-emerald-700 hover:underline"
          >
            Забыли пароль?
          </Link>
        </p>

        <p className="mt-6 text-center text-sm text-stone-500">
          Нет аккаунта?{" "}
          <Link
            href="/register"
            className="font-medium text-emerald-700 hover:underline"
          >
            Регистрация
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
