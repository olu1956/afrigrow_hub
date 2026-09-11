import type { Metadata } from "next";
import { DirectoryModerationAdmin } from "@/components/admin/DirectoryModerationAdmin";

export const metadata: Metadata = {
  title: "Directory Moderation — AfriGrow Hub Admin",
  description: "Verify businesses, unlist listings, or remove duplicate accounts.",
};

export default function DirectoryModerationAdminPage() {
  return <DirectoryModerationAdmin />;
}
