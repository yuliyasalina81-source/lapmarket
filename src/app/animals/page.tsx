/** Server Component */
/** /animals — каталог объявлений: покупка и усыновление животных */
import { auth } from "@/lib/auth";
import { getPublishedListings } from "@/lib/queries/animals";
import { AnimalsView } from "@/components/animals/animals-view";

export const metadata = {
  title: "Питомцы — ЛапМаркет",
};

export default async function AnimalsPage() {
  const session = await auth();
  const [pedigreeListings, goodHandsListings] = await Promise.all([
    getPublishedListings("PEDIGREE"),
    getPublishedListings("GOOD_HANDS"),
  ]);

  const role = session?.user?.role;
  const canCreate = role === "SELLER" || role === "SHELTER";

  return (
    <AnimalsView
      pedigreeListings={pedigreeListings}
      goodHandsListings={goodHandsListings}
      canCreate={canCreate}
      isLoggedIn={!!session?.user}
    />
  );
}
