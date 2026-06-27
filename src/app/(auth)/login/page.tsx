/** Server Component */
/** /login — вход через NextAuth (credentials), форма LoginForm */
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";
import { resolvePostLoginPath } from "@/lib/auth-redirect";

export const metadata = {
  title: "Вход — ЛапМаркет",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) {
    redirect(resolvePostLoginPath(session.user.role));
  }

  return (
    <div className="px-4 py-12 sm:px-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
