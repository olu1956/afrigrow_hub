import type { Metadata } from "next";
import { ProfileAgent } from "@/components/profile/ProfileAgent";

export const metadata: Metadata = {
  title: "Business Profile — AfriGrow Hub",
  description: "Build your professional business profile with AI assistance.",
};

export default function ProfilePage() {
  return <ProfileAgent />;
}
