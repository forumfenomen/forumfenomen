import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import AuthSessionIndicator from "@/components/auth-session-indicator";
import PresenceTracker from "@/components/presence-tracker";
import RouteScrollReset from "@/components/route-scroll-reset";
import "./globals.css";
export const metadata: Metadata = {
  title: "ForumFenomen",
  description: "Fikirler buluşur, fenomenler konuşur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <RouteScrollReset />
        <PresenceTracker />
        <AuthSessionIndicator />
        {children}
        <Analytics />
      </body>
    </html>
  );
}