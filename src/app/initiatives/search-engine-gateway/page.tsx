import type { Metadata } from "next";
import { Globe, Search, Sparkles, TrendingUp } from "lucide-react";
import { InitiativePage } from "@/components/landing/InitiativePage";

export const metadata: Metadata = {
  title: "Search Engine Gateway — AfriGrow Hub",
  description:
    "Help customers find your African business online with profiles and SEO-friendly content.",
};

export default function SearchEngineGatewayPage() {
  return (
    <InitiativePage
      eyebrow="Initiatives"
      title="Search Engine Gateway"
      description="Get found in the AfriGrow Business Directory and build SEO-friendly profile content you can use on your website and social channels."
      highlights={[
        {
          icon: Search,
          title: "AfriGrow directory",
          description:
            "Appear when buyers browse by category, country, or service on AfriGrow Hub.",
        },
        {
          icon: Sparkles,
          title: "AI-written bios",
          description:
            "The Profile Agent creates professional, keyword-rich business descriptions.",
        },
        {
          icon: Globe,
          title: "Online presence",
          description:
            "Link your website, WhatsApp, and social channels from one hub.",
        },
        {
          icon: TrendingUp,
          title: "Content you can reuse",
          description:
            "Marketing posts and promos you can publish on your own channels — content Google can index when on your site.",
        },
      ]}
      steps={[
        {
          title: "Complete your profile",
          description:
            "Add services, location, and a keyword-rich description of what you do.",
        },
        {
          title: "Publish regularly",
          description:
            "Use the Marketing Agent to keep your brand visible with fresh content.",
        },
        {
          title: "Get found in the directory",
          description:
            "Appear when buyers browse by category, country, or service type.",
        },
      ]}
      cta={{
        label: "Build your profile",
        href: "/dashboard/profile",
        secondary: { label: "Join free", href: "/join" },
      }}
    />
  );
}
