"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Search, User } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { marketingFieldBorderClass } from "@/components/dashboard/DashboardPageCanvas";
import { useSession } from "@/components/providers/SessionProvider";
import { useDashboardBusiness } from "@/lib/use-dashboard-business";
import { useState } from "react";

type DashboardHeaderProps = {
  onMenuClick: () => void;
  title?: string;
};

export function DashboardHeader({ onMenuClick, title = "Overview" }: DashboardHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { signOut } = useSession();
  const { business, loading } = useDashboardBusiness();

  const displayName = business.owner.trim() || business.email.split("@")[0] || "Account";
  const displayInitials =
    business.initials.trim() ||
    displayName
      .split(" ")
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) ||
    "?";

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted hover:bg-primary-light md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <BrandLogo className="md:hidden" size="sm" />

      <div className="hidden min-w-0 sm:block">
        <p className="text-xs font-medium text-muted">Dashboard</p>
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
      </div>

      <div className="relative mx-auto hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Search agents, contacts, matches…"
          className={`w-full rounded-xl bg-card py-2 pl-10 pr-4 text-sm shadow-sm shadow-primary/5 outline-none transition placeholder:text-muted/70 ${marketingFieldBorderClass} focus:border-primary focus:ring-2 focus:ring-primary/20`}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="relative rounded-xl border border-border bg-card p-2 text-muted transition hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card py-1.5 pl-1.5 pr-3 text-sm transition hover:border-primary/30"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
              {loading ? "…" : displayInitials}
            </span>
            <span className="hidden font-medium text-foreground sm:inline">
              {loading ? "Loading…" : displayName}
            </span>
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
                aria-label="Close user menu"
              />
              <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-border bg-card py-1 shadow-lg">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-primary-light/50"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4 text-muted" />
                  Account settings
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-primary-light/50"
                  onClick={() => setMenuOpen(false)}
                >
                  <LogOut className="h-4 w-4 text-muted" />
                  Back to website
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground hover:bg-primary-light/50"
                >
                  <LogOut className="h-4 w-4 text-muted" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
