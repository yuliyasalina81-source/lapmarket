/** Server Component */
/** Корневой layout приложения: метаданные, навбар, сессия, PWA, футер */
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { NavbarNotifications } from "@/components/layout/navbar-notifications";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SessionProvider } from "@/components/layout/session-provider";
import { AppToaster } from "@/components/ui/toaster";
import { InstallBanner } from "@/components/pwa/install-banner";
import { MobileFallback } from "@/components/pwa/mobile-fallback";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { ContactChatWidget } from "@/components/marketing/ContactChatWidget";
import {
  SocialLinksStatic,
  SocialMobileBar,
} from "@/components/layout/social-links-static";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "ЛапМаркет — паспорт питомца и маркетплейс",
  description:
    "Цифровой паспорт питомца: прививки, напоминания, медкарта. Маркет, объявления, ветеринары и соцсеть.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "ЛапМаркет" },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#059669",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <div className="app-gradient flex min-h-full flex-col">
          <SessionProvider session={session}>
            <Navbar
              notifications={
                <Suspense fallback={null}>
                  <NavbarNotifications />
                </Suspense>
              }
              headerSocial={
                <div className="flex shrink-0 items-center">
                  <SocialLinksStatic />
                </div>
              }
              menuSocial={<SocialLinksStatic variant="mobile-menu" />}
            />
            <main className="flex-1 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-0">
              {children}
            </main>
            <Footer />
            <SocialMobileBar />
            <MobileBottomNav />
            <ContactChatWidget />
            <AppToaster />
            <InstallBanner />
            <MobileFallback />
            <ServiceWorkerRegister />
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
