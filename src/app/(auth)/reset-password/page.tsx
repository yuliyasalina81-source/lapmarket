/** Server Component */
/** /reset-password — новый пароль по token и email из query после письма */
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-stone-900">Новый пароль</h1>
      <ResetPasswordForm token={params.token ?? ""} email={params.email ?? ""} />
      <p className="mt-6 text-center text-sm text-stone-600">
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
