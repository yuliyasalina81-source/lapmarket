"use client";

/** Client Component */
/** Провайдер NextAuth для клиентских хуков сессии */

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { ReactNode } from "react";

/**
 * Обёртка SessionProvider из next-auth/react
 */
export function SessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return (
    <NextAuthSessionProvider session={session} refetchOnWindowFocus>
      {children}
    </NextAuthSessionProvider>
  );
}
