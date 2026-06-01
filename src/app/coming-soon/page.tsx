/** Server Component */
/** Внутренний маршрут заглушки (rewrite из middleware) */
import { ComingSoon } from "@/components/marketing/coming-soon";

export const metadata = {
  title: "Скоро откроется — ЛапМаркет",
};

export default function ComingSoonPage() {
  return <ComingSoon />;
}
