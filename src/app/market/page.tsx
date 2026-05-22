import { getPublishedProducts } from "@/lib/queries/products";
import { MarketView } from "@/components/market/market-view";

export const metadata = {
  title: "Товары — ЛапМаркет",
};

export default async function MarketPage() {
  const products = await getPublishedProducts();
  return <MarketView products={products} />;
}
