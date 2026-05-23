import { getMarketSellers, getPublishedProducts } from "@/lib/queries/products";
import { MarketView } from "@/components/market/market-view";
import { CartDrawer } from "@/components/market/cart-drawer";
import type { ProductCategory } from "@prisma/client";

export const metadata = {
  title: "Товары — ЛапМаркет",
};

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sellerId?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const products = await getPublishedProducts({
    category: params.category as ProductCategory | undefined,
    minPrice: params.minPrice ? parseInt(params.minPrice, 10) : undefined,
    maxPrice: params.maxPrice ? parseInt(params.maxPrice, 10) : undefined,
    sellerId: params.sellerId || undefined,
    q: params.q,
    sort: (params.sort as "newest" | "price_asc" | "price_desc" | "rating") || "newest",
  });
  const sellers = await getMarketSellers();
  const productsById = Object.fromEntries(
    products.map((p) => [
      p.id,
      {
        id: p.id,
        title: p.title,
        price: p.price,
        sellerId: p.sellerId,
        sellerName: p.seller.displayName ?? "Продавец",
      },
    ])
  );
  return (
    <>
      <MarketView products={products} sellers={sellers} />
      <CartDrawer productsById={productsById} />
    </>
  );
}
