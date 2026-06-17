"use client";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { useSession } from "@/components/providers/SessionProvider";
import { mockBusiness } from "@/lib/dashboard-nav";

export function SettingsPanel() {
  const { session, hydrated } = useSession();
  const business = hydrated ? session : mockBusiness;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Account and business preferences — full settings UI in a later phase."
      />

      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <label className="text-sm font-medium text-foreground">Business name</label>
          <input
            readOnly
            value={business.name}
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Owner</label>
          <input
            readOnly
            value={business.owner}
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            readOnly
            value={business.email}
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Location</label>
          <input
            readOnly
            value={business.location}
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Plan</label>
          <input
            readOnly
            value={`${business.plan} (preview)`}
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground"
          />
        </div>
      </div>
    </div>
  );
}
