import { redirect } from "next/navigation";

export default function ProfileBookingsRedirect() {
  redirect("/dashboard/client");
}
