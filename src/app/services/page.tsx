import { auth } from "@/lib/auth";
import { getServiceProviders } from "@/lib/queries/services";
import { ServicesView } from "@/components/services/services-view";

export const metadata = {
  title: "Услуги — ЛапМаркет",
};

export default async function ServicesPage() {
  const session = await auth();
  const providers = await getServiceProviders();
  return <ServicesView providers={providers} isLoggedIn={!!session?.user} />;
}
