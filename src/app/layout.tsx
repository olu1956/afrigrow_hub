import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { EARLY_ACCESS_FOOTER } from "@/lib/product-messaging";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AfriGrow Hub — Free Early Access for African SMEs",
    template: "%s — AfriGrow Hub",
  },
  description:
    "Free early access for African SMEs: AI profiles, marketing, matching, funding readiness, CRM, and business guides — one platform. No credit card required.",
  keywords: [
    "African SMEs",
    "business growth",
    "AI marketing",
    "business directory",
    "funding readiness",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName: "AfriGrow Hub",
    title: "AfriGrow Hub — Free Early Access for African SMEs",
    description: EARLY_ACCESS_FOOTER,
    images: [{ url: "/afrigrow-logo.png", width: 1024, height: 1024, alt: "AfriGrow Hub" }],
  },
  twitter: {
    card: "summary",
    title: "AfriGrow Hub — Free Early Access",
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
    <html lang="en" className={`${dmSans.variable} h-full scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
