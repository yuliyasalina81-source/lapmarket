import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Регистрация — ЛапМаркет",
};

export default function RegisterPage() {
  return (
    <div className="px-4 py-12 sm:px-6">
      <RegisterForm />
    </div>
  );
}
