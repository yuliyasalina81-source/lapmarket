/** Server Component */
/** /forgot-password — запрос письма со ссылкой сброса пароля */
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-stone-900">Сброс пароля</h1>
      <p className="mt-2 text-sm text-stone-600">
        Укажите email — отправим ссылку для восстановления.
      </p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-stone-600">
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          Вернуться ко входу
        </Link>
      </p>
    </div>
  );
}
