"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardPageCanvas } from "@/components/dashboard/DashboardPageCanvas";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useSession } from "@/components/providers/SessionProvider";
import { checkPlatformAdminAction } from "@/lib/auth/enterprise-enquiry-actions";
import { adminNav, allNavItems } from "@/lib/dashboard-nav";

export function DashboardShell({
  children,
  isPlatformAdmin: serverIsPlatformAdmin = false,
}: {
  children: React.ReactNode;
  isPlatformAdmin?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isPlatformAdmin: sessionIsPlatformAdmin, hydrated, authEnabled } = useSession();
  const [showAdmin, setShowAdmin] = useState(serverIsPlatformAdmin);

  // Once admin access is confirmed, keep it for this dashboard session (never flip back off).
  useEffect(() => {
    if (serverIsPlatformAdmin || sessionIsPlatformAdmin) {
      setShowAdmin(true);
    }
  }, [serverIsPlatformAdmin, sessionIsPlatformAdmin]);

  useEffect(() => {
    if (!hydrated || !authEnabled || showAdmin) return;

    let active = true;
    void checkPlatformAdminAction().then((result) => {
      if (!active) return;
      if (result.ok && result.isAdmin) {
        setShowAdmin(true);
      }
    });

    return () => {
      active = false;
    };
  }, [authEnabled, hydrated, showAdmin]);

  const navItems = showAdmin ? [...allNavItems, ...adminNav] : allNavItems;

  const current = navItems.find((item) =>
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href),
  );

  const headerTitle = current?.label ?? "Dashboard";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        showAdmin={showAdmin}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          title={headerTitle}
        />
        <main className="flex-1 overflow-y-auto">
          <DashboardPageCanvas variant="marketing">{children}</DashboardPageCanvas>
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}
