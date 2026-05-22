import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isCertifiedSeller } from "@/lib/user";
import { ProductForm } from "@/components/seller/product-form";

export const metadata = { title: "Новый товар — ЛапМаркет" };

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SELLER") redirect("/profile");
  if (!(await isCertifiedSeller(session.user.id))) {
    redirect("/seller/products");
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-stone-900">Новый товар</h1>
      <ProductForm />
    </div>
  );
}
