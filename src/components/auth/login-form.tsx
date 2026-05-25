"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { PawPrint, Loader2 } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { resolvePostLoginPath } from "@/lib/auth-redirect";
import { loginSchema } from "@/lib/validations/auth";

type SignInResult = {
  error?: string;
  ok?: boolean;
  status?: number;
  url?: string | null;
};

function isSignInFailure(result: unknown): boolean {
  if (result && typeof result === "object" && "error" in result) {
    const { error, ok } = result as SignInResult;
    if (error) return true;
    if (ok === false) return true;
    return false;
  }

  if (typeof result === "string") {
    return (
      result.includes("error=CredentialsSignin") ||
      result.includes("error=credentials")
    );
  }

  return false;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const registeredSpecialist = searchParams.get("registered") === "specialist";
  const supabasePending = searchParams.get("supabase") === "pending";
  const profilePending = searchParams.get("profile") === "pending";
  const callbackRedirect = searchParams.get("callbackUrl");
  const defaultRedirect = resolvePostLoginPath();

  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const authError = searchParams.get("error");
    if (authError === "CredentialsSignin") {
      setError("Неверный email или пароль");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setFieldErrors(undefined);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const raw = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      setFieldErrors(
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
      setPending(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: parsed.data.email.toLowerCase().trim(),
        password: parsed.data.password,
        redirect: false,
        redirectTo: callbackRedirect ?? defaultRedirect,
      });

      if (isSignInFailure(result)) {
        setError("Неверный email или пароль");
        setPending(false);
        return;
      }

      const session = await getSession();
      const target = callbackRedirect?.startsWith("/")
        ? callbackRedirect
        : resolvePostLoginPath(session?.user?.role);
      window.location.replace(target);
    } catch {
      setError("Ошибка входа. Попробуйте снова.");
      setPending(false);
    }
  }

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

        {registeredSpecialist && (
          <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {supabasePending
              ? "Аккаунт специалиста создан. Войдите — каталог услуг подключится после настройки сервера."
              : profilePending
                ? "Аккаунт создан. Войдите и в кабинете специалиста загрузите лицензию и услуги."
                : "Аккаунт специалиста создан. Войдите — профиль на проверке у модератора."}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            {fieldErrors?.email && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.email[0]}
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
            {fieldErrors?.password && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.password[0]}
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
