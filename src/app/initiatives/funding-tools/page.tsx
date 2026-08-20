import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Funding Tools — AfriGrow Hub",
  description:
    "Funding tools live under Access to Finance — grants, readiness, and apply guidance for African SMEs.",
};

/** Kept for clarity; permanent redirect also configured in next.config.ts */
export default function FundingToolsPage() {
  redirect("/initiatives/access-to-finance");
}
