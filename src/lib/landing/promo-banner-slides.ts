import {
  Bot,
  BookOpen,
  Building2,
  Handshake,
  Megaphone,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type PromoBannerSlide = {
  id: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  tagline: string;
  headline: string;
  highlight: string;
  detail: string;
  ctaLabel: string;
  ctaHref: string;
  authenticatedCtaHref?: string;
  gradient: string;
  accentClass: string;
};

export const promoBannerSlides: PromoBannerSlide[] = [
  {
    id: "platform",
    icon: Sparkles,
    eyebrow: "AfriGrow Hub",
    title: "Grow smarter",
    tagline: "Profile · Promote · Connect",
    headline: "The smarter way for African SMEs to grow online",
    highlight: "Founding members join free before premium launches",
    detail: "No card charges during free early access. Lock in your founding spot today.",
    ctaLabel: "Join free today",
    ctaHref: "/signup",
    authenticatedCtaHref: "/dashboard",
    gradient: "from-primary-dark via-primary to-[#0d5a40]",
    accentClass: "text-accent",
  },
  {
    id: "directory",
    icon: Building2,
    eyebrow: "Business Directory",
    title: "Get discovered",
    tagline: "Visible · Trusted · Local",
    headline: "Show up where buyers and partners are searching",
    highlight: "Reach 40% profile strength",
    detail: "Appear in the AfriGrow Business Directory.",
    ctaLabel: "Build your profile",
    ctaHref: "/signup",
    authenticatedCtaHref: "/dashboard/profile",
    gradient: "from-[#0a4d35] via-primary-dark to-primary",
    accentClass: "text-accent",
  },
  {
    id: "agents",
    icon: Bot,
    eyebrow: "AI Agents",
    title: "Work smarter",
    tagline: "Marketing · CRM · Matching",
    headline: "Six intelligent agents built for African businesses",
    highlight: "Marketing · CRM · Matching · Funding",
    detail: "Create content, track leads, and find the right connections.",
    ctaLabel: "Explore agents",
    ctaHref: "/#agents",
    authenticatedCtaHref: "/dashboard",
    gradient: "from-primary-dark via-[#0c6144] to-[#117a55]",
    accentClass: "text-accent",
  },
  {
    id: "funding",
    icon: Wallet,
    eyebrow: "Funding Tools",
    title: "Get funding-ready",
    tagline: "Find · Prepare · Apply",
    headline: "Discover grants and build your funding readiness",
    highlight: "Country-aware programmes",
    detail: "Matched to your business stage and location.",
    ctaLabel: "Explore funding",
    ctaHref: "/signup",
    authenticatedCtaHref: "/dashboard/funding",
    gradient: "from-[#083d2b] via-primary-dark to-primary",
    accentClass: "text-accent",
  },
  {
    id: "marketing",
    icon: Megaphone,
    eyebrow: "Marketing Agent",
    title: "Promote faster",
    tagline: "Social · WhatsApp · Campaigns",
    headline: "Create marketing content in your brand voice",
    highlight: "Social · WhatsApp · Campaigns",
    detail: "Draft posts and promos in seconds — save and reuse anytime.",
    ctaLabel: "Start promoting",
    ctaHref: "/signup",
    authenticatedCtaHref: "/dashboard/marketing",
    gradient: "from-primary-dark via-primary to-[#0f6b4a]",
    accentClass: "text-accent",
  },
  {
    id: "academy",
    icon: BookOpen,
    eyebrow: "Build a Business Academy",
    title: "Learn & grow",
    tagline: "Guides · Tools · Action",
    headline: "Free SME business guides on profile, marketing, funding & more",
    highlight: "Published guides · Free for members",
    detail: "Practical steps linked to your AfriGrow dashboard tools.",
    ctaLabel: "Browse guides",
    ctaHref: "/initiatives/business-academy",
    authenticatedCtaHref: "/initiatives/business-academy",
    gradient: "from-[#0a4d35] via-primary-dark to-[#117a55]",
    accentClass: "text-accent",
  },
  {
    id: "matching",
    icon: Handshake,
    eyebrow: "Matching Marketplace",
    title: "Find partners",
    tagline: "Buyers · Suppliers · Events",
    headline: "Connect with the right businesses across Africa",
    highlight: "Buyers · Suppliers · Event clients",
    detail: "Send enquiries from the Matching Marketplace.",
    ctaLabel: "Browse marketplace",
    ctaHref: "/signup",
    authenticatedCtaHref: "/dashboard/matching",
    gradient: "from-[#0a4d35] via-[#0d5a40] to-primary",
    accentClass: "text-accent",
  },
];
