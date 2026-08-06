import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { EARLY_ACCESS_FOOTER } from "@/lib/product-messaging";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AfriGrow Hub — Founding Members Join Free",
    template: "%s — AfriGrow Hub",
  },
  description:
    "Join as a founding member of AfriGrow Hub — free early access for African and Black-owned SMEs. AI profiles, marketing, matching, funding readiness, and CRM. No credit card required.",
  keywords: [
    "African SMEs",
    "business growth",
    "AI marketing",
    "business directory",
    "funding readiness",
    "founding members",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName: "AfriGrow Hub",
    title: "AfriGrow Hub — Founding Members Join Free",
    description: EARLY_ACCESS_FOOTER,
    images: [{ url: "/afrigrow-logo.png", width: 1024, height: 1024, alt: "AfriGrow Hub" }],
  },
  twitter: {
    card: "summary",
    title: "AfriGrow Hub — Founding Members Join Free",
    description: EARLY_ACCESS_FOOTER,
    images: ["/afrigrow-logo.png"],
  },
  icons: {
    icon: "/afrigrow-logo.png",
    apple: "/afrigrow-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
