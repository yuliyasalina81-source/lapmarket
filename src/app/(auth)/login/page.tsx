import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Вход — ЛапМаркет",
};

export default function LoginPage() {
  return (
    <div className="px-4 py-12 sm:px-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
