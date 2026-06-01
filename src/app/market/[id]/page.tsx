/** Server Component */
/** /market/[id] — карточка товара, запрос продавцу */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Star } from "lucide-react";
import { getProductById, getProductReviews } from "@/lib/queries/products";
import { ProductReviews } from "@/components/market/product-reviews";
import { PRODUCT_CATEGORY_LABELS } from "@/lib/constants";
import { formatPrice, formatRating } from "@/lib/format";
import { ProductImage } from "@/components/ui/product-image";
import { CartButton } from "@/components/market/cart-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  return { title: product ? `${product.title} — ЛапМаркет` : "Товар" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, reviews] = await Promise.all([
    getProductById(id),
    getProductReviews(id),
  ]);
  if (!product || product.status !== "PUBLISHED") notFound();

  const shop = product.seller.sellerProfile;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/market" className="text-sm text-emerald-700 hover:underline">
        ← Назад к каталогу
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {product.images.map((img) => (
            <div key={img.id} className="relative h-64 overflow-hidden rounded-2xl">
              <ProductImage src={img.media.url} alt={product.title} fill />
            </div>
          ))}
        </div>
        <div>
          <span className="text-xs font-semibold uppercase text-emerald-700">
            {PRODUCT_CATEGORY_LABELS[product.category]}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-stone-900">{product.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-stone-500">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {formatRating(product.rating)}
          </div>
          <p className="mt-4 text-3xl font-bold text-emerald-700">
            {formatPrice(product.price)}
          </p>
          <p className="mt-6 leading-relaxed text-stone-700">{product.description}</p>
          {shop && (
            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                {shop.shopName}
              </p>
              <p className="mt-1 text-sm text-stone-600">{shop.description}</p>
            </div>
          )}
          <CartButton sellerId={product.sellerId} productId={product.id} />
        </div>
      </div>
      <ProductReviews
        reviews={reviews}
        rating={product.rating}
        reviewCount={product.reviewCount}
      />
    </div>
  );
}
