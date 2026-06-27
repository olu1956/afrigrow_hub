import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSessionDataAction } from "@/lib/auth/get-session-data";

export const metadata: Metadata = {
  title: "Dashboard — AfriGrow Hub",
  description: "Manage your business growth with AfriGrow Hub AI agents.",
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionData = await getSessionDataAction();
  const isPlatformAdmin = sessionData?.isPlatformAdmin ?? false;

  return (
    <DashboardShell isPlatformAdmin={isPlatformAdmin}>{children}</DashboardShell>
  );
}
