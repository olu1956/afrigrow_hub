import type { Metadata } from "next";
import { DirectoryModerationAdmin } from "@/components/admin/DirectoryModerationAdmin";

export const metadata: Metadata = {
  title: "Directory Moderation — AfriGrow Hub Admin",
  description: "Unlist or remove businesses from the AfriGrow Directory.",
};

export default function DirectoryModerationAdminPage() {
  return <DirectoryModerationAdmin />;
}
