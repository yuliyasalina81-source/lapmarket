/** Server Component */
/** /profile/bookings — редирект на /dashboard/client */
import { redirect } from "next/navigation";

export default function ProfileBookingsRedirect() {
  redirect("/dashboard/client");
}
