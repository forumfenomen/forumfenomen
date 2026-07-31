import type { Metadata } from "next";
import type { ReactNode } from "react";
import AuthSessionIndicator from "@/components/auth-session-indicator";
import PresenceTracker from "@/components/presence-tracker";
import ScrollToTop from "@/components/scroll-to-top";
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
        <PresenceTracker />
        <AuthSessionIndicator />
        {children}
      </body>
    </html>
  );
}