import {
  BarChart3,
  BookOpen,
  Building2,
  CreditCard,
  GraduationCap,
  Handshake,
  Inbox,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Settings,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  module?: number;
};

export type AgentModule = NavItem & {
  name: string;
  tagline: string;
  longDescription: string;
};

export const agentModules: AgentModule[] = [
  {
    label: "Business Profile",
    name: "Business Profile Agent",
    href: "/dashboard/profile",
    icon: Building2,
    description: "Profile Agent",
    tagline: "Look professional online",
    longDescription:
      "Build a complete business profile with AI-written bios, service lists, and SEO-friendly descriptions.",
    module: 5,
  },
  {
    label: "Marketing",
    name: "Marketing Agent",
    href: "/dashboard/marketing",
    icon: Megaphone,
    description: "Marketing Agent",
    tagline: "Promote smarter",
    longDescription:
      "Create social content, WhatsApp broadcasts, and promotional copy in seconds — in your brand voice.",
    module: 6,
  },
  {
    label: "Growth",
    name: "Growth & Pain Point Agent",
    href: "/dashboard/growth",
    icon: TrendingUp,
    description: "Pain Point Agent",
    tagline: "Solve what holds you back",
    longDescription:
      "Diagnose business challenges and receive step-by-step growth plans tailored to your sector.",
    module: 7,
  },
  {
    label: "Matching",
    name: "Matching Marketplace",
    href: "/dashboard/matching",
    icon: Handshake,
    description: "Marketplace",
    tagline: "Find the right connections",
    longDescription:
      "Get matched with buyers, suppliers, and partners based on category, location, and needs.",
    module: 8,
  },
  {
    label: "Funding",
    name: "Finance & Funding Agent",
    href: "/dashboard/funding",
    icon: Wallet,
    description: "Finance Agent",
    tagline: "Get funding-ready",
    longDescription:
      "Browse grants, track eligibility, and complete readiness checklists with guided support.",
    module: 9,
  },
  {
    label: "CRM",
    name: "Customer Follow-Up CRM",
    href: "/dashboard/crm",
    icon: MessageSquare,
    description: "Follow-Up Agent",
    tagline: "Never miss a lead",
    longDescription:
      "Manage contacts, schedule follow-ups, and automate customer communication workflows.",
    module: 10,
  },
];

export const workspaceModules: NavItem[] = [
  {
    label: "Directory",
    href: "/dashboard/directory",
    icon: BookOpen,
    description: "Business listings",
  },
  {
    label: "Training",
    href: "/dashboard/training",
    icon: GraduationCap,
    description: "Courses & live sessions",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "Insights & reports",
  },
];

export const mainNav: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Your business at a glance",
  },
  ...agentModules,
  ...workspaceModules,
];

export const adminNav: NavItem[] = [
  {
    label: "Inbound leads",
    href: "/dashboard/admin/enquiries",
    icon: Inbox,
    description: "Contact, partner & Enterprise",
  },
  {
    label: "Business guides",
    href: "/dashboard/admin/guides",
    icon: BookOpen,
    description: "Publish academy guides",
  },
];

export const bottomNav: NavItem[] = [
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    description: "Plan & payments",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export const allNavItems: NavItem[] = [...mainNav, ...bottomNav];

export const mockBusiness = {
  name: "Amara's Textiles",
  owner: "Amara Okonkwo",
  email: "hello@amarastextiles.com",
  plan: "Growth",
  location: "Lagos, Nigeria",
  country: "Nigeria",
  role: "owner",
  initials: "AO",
};
