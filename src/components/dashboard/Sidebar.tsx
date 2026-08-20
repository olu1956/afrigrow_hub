"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { adminNav, bottomNav, mainNav } from "@/lib/dashboard-nav";
import { useDashboardBusiness } from "@/lib/use-dashboard-business";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  showAdmin?: boolean;
};

function NavLink({
  href,
  label,
  icon: Icon,
  description,
  module,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  module?: number;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
        active
          ? "bg-primary text-white shadow-sm shadow-primary/20"
          : "text-muted hover:bg-primary-light/60 hover:text-foreground"
      }`}
    >
      <Icon
        className={`h-5 w-5 shrink-0 ${active ? "text-white" : "text-muted group-hover:text-primary"}`}
      />
      <span className="flex-1">
        <span className={`block font-medium ${active ? "text-white" : ""}`}>{label}</span>
        {description && (
          <span
            className={`block text-xs ${active ? "text-white/70" : "text-muted/80"}`}
          >
            {description}
          </span>
        )}
      </span>
      {module && !active && (
        <span className="rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
          M{module}
        </span>
      )}
    </Link>
  );
}

export function Sidebar({ open, onClose, showAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const { business } = useDashboardBusiness();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-border px-4 md:px-5">
        <BrandLogo onClick={onClose} size="sm" />
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted hover:bg-primary-light md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Workspace
        </p>
        {mainNav.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={isActive(item.href)}
            onNavigate={onClose}
          />
        ))}
      </nav>

      <div className="shrink-0 border-t border-border px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Account
        </p>
        <div className="space-y-1">
          {bottomNav.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={isActive(item.href)}
              onNavigate={onClose}
            />
          ))}
        </div>

        {showAdmin ? (
          <div className="mt-4 space-y-1 border-t border-border pt-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Admin
            </p>
            {adminNav.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={isActive(item.href)}
                onNavigate={onClose}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {business.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {business.name}
            </p>
            <p className="truncate text-xs text-muted">{business.plan} plan</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Fixed sidebar — stays put without sticky scroll chaining on the page. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border bg-card md:flex">
        {content}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close menu overlay"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-card shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
