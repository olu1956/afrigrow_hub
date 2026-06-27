import type { Metadata } from "next";
import { CalendarHeart, Megaphone, PartyPopper, Users } from "lucide-react";
import { InitiativePage } from "@/components/landing/InitiativePage";

export const metadata: Metadata = {
  title: "Small Business Friday — AfriGrow Hub",
  description:
    "Promote your business with Small Business Friday campaigns and AI marketing tools.",
};

export default function SmallBusinessFridayPage() {
  return (
    <InitiativePage
      eyebrow="Initiatives"
      title="Small Business Friday"
      description="Join a movement that celebrates African small businesses. Run Friday promos, share your story, and attract new customers with ready-made campaign tools."
      highlights={[
        {
          icon: PartyPopper,
          title: "Friday promo campaigns",
          description:
            "Launch limited-time offers with templates for social, WhatsApp, and flyers.",
        },
        {
          icon: Megaphone,
          title: "AI marketing content",
          description:
            "Generate posts in your brand voice in seconds with the Marketing Agent.",
        },
        {
          icon: Users,
          title: "Community visibility",
          description:
            "Get featured in directory highlights during Small Business Friday events.",
        },
        {
          icon: CalendarHeart,
          title: "Plan ahead",
          description:
            "Schedule campaigns and follow-ups so every Friday drives footfall or orders.",
        },
      ]}
      steps={[
        {
          title: "Pick your Friday offer",
          description:
            "Choose a discount, bundle, or freebie that works for your margins.",
        },
        {
          title: "Create campaign assets",
          description:
            "Use AI to write posts and design-ready copy for all your channels.",
        },
        {
          title: "Follow up leads",
          description:
            "Capture enquiries in CRM and convert weekend interest into sales.",
        },
      ]}
      cta={{
        label: "Open Marketing Agent",
        href: "/dashboard/marketing",
        secondary: { label: "Join free", href: "/join" },
      }}
    />
  );
}
