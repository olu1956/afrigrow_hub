import Link from "next/link";

export function DashboardFooter() {
  return (
    <footer className="shrink-0 border-t border-primary-dark/20 bg-gradient-to-r from-primary-dark to-primary px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <p className="text-xs text-white/70">
          © {new Date().getFullYear()} AfriGrow Hub. Phase 1 — UI/UX preview.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs font-medium text-white/80">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <Link href="/dashboard" className="transition hover:text-white">
            Dashboard
          </Link>
          <Link href="/dashboard/directory" className="transition hover:text-white">
            Directory
          </Link>
          <Link href="/dashboard/analytics" className="transition hover:text-white">
            Analytics
          </Link>
          <Link href="/dashboard/billing" className="transition hover:text-white">
            Billing
          </Link>
          <Link href="/dashboard/settings" className="transition hover:text-white">
            Settings
          </Link>
        </nav>
      </div>
    </footer>
  );
}
