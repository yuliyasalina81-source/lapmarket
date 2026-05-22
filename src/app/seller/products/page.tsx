import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSellerProducts } from "@/lib/queries/products";
import { isCertifiedSeller } from "@/lib/user";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { getProductMainImage } from "@/lib/queries/products";
import { ProductImage } from "@/components/ui/product-image";
import { CertificationBanner } from "@/components/seller/certification-banner";

export const metadata = { title: "Мои товары — ЛапМаркет" };

export default async function SellerProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SELLER") redirect("/profile");

  const certified = await isCertifiedSeller(session.user.id);
  const products = await getSellerProducts(session.user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Мои товары</h1>
        {certified && (
          <Link
            href="/seller/products/new"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            + Добавить
          </Link>
        )}
      </div>
      {!certified && <CertificationBanner />}
      <div className="mt-8 space-y-4">
        {products.length === 0 ? (
          <p className="text-stone-500">Товаров пока нет</p>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="flex gap-4 rounded-2xl border border-stone-100 bg-white p-4"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                <ProductImage src={getProductMainImage(p)} alt={p.title} fill />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-stone-900">{p.title}</p>
                <p className="text-sm text-stone-500">
                  {PRODUCT_CATEGORY_LABELS[p.category]} · {p.status}
                </p>
                <p className="text-emerald-700 font-bold">{formatPrice(p.price)}</p>
              </div>
              <Link
                href={`/seller/products/${p.id}/edit`}
                className="self-center text-sm text-emerald-700 hover:underline"
              >
                Изменить
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
