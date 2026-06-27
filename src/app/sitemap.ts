import type { MetadataRoute } from "next";
import { initiativeLinks } from "@/lib/initiatives-nav";
import { homeSectionLinks } from "@/lib/home-nav";

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();

  const staticPages = [
    "",
    "/join",
    "/signup",
    "/login",
    "/about",
    "/contact",
    "/privacy",
    "/partners",
    "/partners/become-a-partner",
    "/initiatives/business-academy",
  ];

  return [
    ...staticPages.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...initiativeLinks.map((link) => ({
      url: `${base}${link.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...homeSectionLinks
      .filter((link) => link.href.startsWith("/"))
      .map((link) => ({
        url: `${base}${link.href}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
  ];
}
