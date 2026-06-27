import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { dashboardCardClass } from "@/components/dashboard/DashboardPageCanvas";

type AdminAccessDeniedProps = {
  authEmail?: string;
  reason?: "not_logged_in" | "not_admin";
};

export function AdminAccessDenied({ authEmail, reason = "not_admin" }: AdminAccessDeniedProps) {
  return (
    <DashboardPageLayout
      title="Admin access required"
      description="This area is limited to platform administrators."
    >
      <div className={`${dashboardCardClass} max-w-2xl space-y-4 p-6`}>
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="space-y-3 text-sm text-foreground">
            {reason === "not_logged_in" ? (
              <p>You need to sign in before opening admin pages.</p>
            ) : (
              <>
                <p>
                  Your account does not have platform admin access
                  {authEmail ? (
                    <>
                      {" "}
                      for <strong>{authEmail}</strong>
                    </>
                  ) : null}
                  .
                </p>
                <p className="text-muted">
                  Admin access must match your <strong>login email</strong> (see Settings), not
                  your business contact email.
                </p>
              </>
            )}

            <ol className="list-decimal space-y-1 pl-5 text-muted">
              <li>
                Open Settings and confirm the login email shown under &quot;Login email&quot;.
              </li>
              <li>
                In Supabase SQL Editor, run{" "}
                <code className="rounded bg-background px-1 py-0.5 text-xs">
                  supabase/scripts/promote_platform_admin.sql
                </code>{" "}
                — replace the emails in that file with your login email if needed.
              </li>
              <li>Sign out, sign back in, then return here.</li>
            </ol>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/dashboard/settings"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Open Settings
              </Link>
              <Link
                href="/dashboard"
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-primary-light/40"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
