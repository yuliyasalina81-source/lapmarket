import { auth } from "@/lib/auth";
import { getNotifications, getUnreadCount } from "@/lib/notifications";
import { NotificationBell } from "@/components/notifications/notification-bell";

export async function NavbarNotifications() {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const [notifications, unreadCount] = await Promise.all([
      getNotifications(session.user.id),
      getUnreadCount(session.user.id),
    ]);

    return (
      <NotificationBell
        notifications={notifications}
        unreadCount={unreadCount}
      />
    );
  } catch {
    return null;
  }
}
