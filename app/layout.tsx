import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomTabBar from "@/components/layout/BottomTabBar";
import DesktopSidebar from "@/components/layout/DesktopSidebar";
import AtmospherePanel from "@/components/layout/AtmospherePanel";
import CursorGlow from "@/components/shared/CursorGlow";
import ThemeProvider from "@/components/layout/ThemeProvider";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "CineVault — 极简高级电影社区",
  description: "发现电影之美，探索影史之深",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-180.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CineVault",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" data-theme="classic">
      <body className="min-h-screen">
        <ThemeProvider>
          <CursorGlow />
          <DesktopSidebar />
          {children}
          <AtmospherePanel />
          <BottomTabBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
