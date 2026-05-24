import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getPendingCertifications,
  getPendingListingsForAdmin,
  getAdminUsers,
  getAdminProducts,
  getAdminPosts,
  getAdminProductReviews,
  getAdminServiceReviews,
  getAdminServiceProviders,
} from "@/lib/queries/admin";
import { AdminPanel } from "@/components/admin/admin-panel";
import { getAdminSpecialists } from "@/lib/queries/services-supabase";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata = { title: "Админ — ЛапМаркет" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/profile");
  }

  const [
    certifications,
    listings,
    users,
    products,
    posts,
    productReviews,
    serviceReviews,
    serviceProviders,
    supabaseSpecialists,
  ] = await Promise.all([
    getPendingCertifications(),
    getPendingListingsForAdmin(),
    getAdminUsers(),
    getAdminProducts(),
    getAdminPosts(),
    getAdminProductReviews(),
    getAdminServiceReviews(),
    getAdminServiceProviders(),
    isSupabaseConfigured() ? getAdminSpecialists() : Promise.resolve([]),
  ]);

  return (
    <AdminPanel
      certifications={certifications}
      listings={listings}
      users={users}
      products={products}
      posts={posts}
      productReviews={productReviews}
      serviceReviews={serviceReviews}
      serviceProviders={serviceProviders}
      supabaseSpecialists={supabaseSpecialists}
    />
  );
}
