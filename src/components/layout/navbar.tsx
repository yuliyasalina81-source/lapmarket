import { auth } from "@/lib/auth";
import { NavbarClient } from "@/components/layout/navbar-client";
import { NavbarNotifications } from "@/components/layout/navbar-notifications";

export async function Navbar() {
  const session = await auth();
  const notifications = session?.user?.id ? (
    <NavbarNotifications />
  ) : null;

  return <NavbarClient notifications={notifications} />;
}
