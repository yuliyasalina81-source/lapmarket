import type { Metadata, Viewport } from "next";

export const dynamic = "force-dynamic";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SessionProvider } from "@/components/layout/session-provider";
import { AppToaster } from "@/components/ui/toaster";
import { InstallBanner } from "@/components/pwa/install-banner";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
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
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <div className="app-gradient flex min-h-full flex-col">
          <SessionProvider>
            <Navbar />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
            <AppToaster />
            <InstallBanner />
            <ServiceWorkerRegister />
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
