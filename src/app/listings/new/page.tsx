/** Server Component */
/** /listings/new — новое объявление о животном (продажа/усыновление) */
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ListingForm } from "@/components/animals/listing-form";

export const metadata = {
  title: "Новое объявление — ЛапМаркет",
};

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/listings/new");
  if (session.user.role !== "SELLER" && session.user.role !== "SHELTER") {
    redirect("/animals");
  }
  return <ListingForm />;
}
