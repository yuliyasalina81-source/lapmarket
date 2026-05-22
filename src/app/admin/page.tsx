import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPendingCertifications } from "@/lib/queries/admin";
import { getPendingListingsForAdmin } from "@/lib/queries/admin";
import { AdminPanel } from "@/components/admin/admin-panel";

export const metadata = { title: "Админ — ЛапМаркет" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/profile");
  }

  const [certifications, listings] = await Promise.all([
    getPendingCertifications(),
    getPendingListingsForAdmin(),
  ]);

  return (
    <AdminPanel certifications={certifications} listings={listings} />
  );
}
