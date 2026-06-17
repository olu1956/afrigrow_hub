import Link from "next/link";
import { ArrowRight, Construction } from "lucide-react";
import type { NavItem } from "@/lib/dashboard-nav";

type AgentPlaceholderProps = {
  item: NavItem;
};

export function AgentPlaceholder({ item }: AgentPlaceholderProps) {
  const Icon = item.icon;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <Icon className="h-7 w-7" />
      </span>
      <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-accent">
        <Construction className="h-3.5 w-3.5" />
        {item.module ? `Module ${item.module} — coming next` : "Coming soon"}
      </div>
      <h2 className="mt-4 text-xl font-bold text-foreground">
        {item.module ? `${item.label} Agent` : item.label}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted">
        {item.module
          ? `The ${item.label.toLowerCase()} workspace will be built in Phase 1, Module ${item.module}. Navigation and layout are ready.`
          : `The ${item.label.toLowerCase()} workspace is on the roadmap. Navigation and layout are ready.`}
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        Back to overview
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
