import type { Metadata } from "next";
import { Bot, Building2, Megaphone, Rocket } from "lucide-react";
import { InitiativePage } from "@/components/landing/InitiativePage";

export const metadata: Metadata = {
  title: "Launch My Startup — AfriGrow Hub",
  description:
    "Launch your African startup with AI-powered profiles, marketing, and growth tools.",
};

export default function LaunchMyStartupPage() {
  return (
    <InitiativePage
      eyebrow="Initiatives"
      title="Launch My Startup"
      description="Starting a new business in Africa? AfriGrow Hub gives you the tools to look professional, promote early, and find your first customers and partners — without hiring a full team."
      highlights={[
        {
          icon: Rocket,
          title: "Launch in days, not months",
          description:
            "Set up a credible business presence quickly with the Profile Agent.",
        },
        {
          icon: Building2,
          title: "Directory listing",
          description:
            "Get discovered by buyers and partners browsing the AfriGrow business directory.",
        },
        {
          icon: Megaphone,
          title: "First marketing campaigns",
          description:
            "Generate social posts, WhatsApp promos, and launch announcements in minutes.",
        },
        {
          icon: Bot,
          title: "AI agents on day one",
          description:
            "Activate marketing, growth, and CRM agents as soon as you join.",
        },
      ]}
      steps={[
        {
          title: "Create your free account",
          description:
            "Sign up with your business name, type, and contact details — takes under 5 minutes.",
        },
        {
          title: "Build your profile",
          description:
            "Add your story, services, and location so customers know who you are.",
        },
        {
          title: "Promote and connect",
          description:
            "Launch your first campaign and start matching with suppliers, buyers, or partners.",
        },
      ]}
      cta={{
        label: "Launch your startup",
        href: "/join",
        secondary: { label: "See how it works", href: "/#how-it-works" },
      }}
    />
  );
}
