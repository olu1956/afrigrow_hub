import Link from "next/link";
import { Wallet } from "lucide-react";
import { EARLY_ACCESS_LABEL } from "@/lib/product-messaging";

export function AccessToFinanceHero() {
  return (
    <section className="bg-primary-dark px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent/40 bg-white/10 text-accent">
            <Wallet className="h-8 w-8" strokeWidth={1.75} />
          </span>
          <p className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Access to <span className="text-accent">Finance</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-accent">Find · Prepare · Apply</p>
        </div>

        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
          {EARLY_ACCESS_LABEL}
        </p>

        <h1 className="mt-6 text-3xl font-bold leading-tight text-accent sm:text-4xl">
          Funding discovery for African SMEs
        </h1>

        <p className="mt-4 text-lg font-semibold text-white">
          Explore programmes — then get funding-ready in your dashboard.
        </p>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
          AfriGrow Hub helps you browse country-aware grants and finance programmes,
          complete readiness checklists, and follow external apply links when you are
          ready — no false promises about instant lending.
        </p>

        <p className="mt-6 text-base italic text-accent sm:text-lg">
          Find programmes. Get ready. Apply with confidence.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex rounded-full bg-white/15 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white ring-1 ring-white/25 transition hover:bg-white/25"
          >
            Join free
          </Link>
          <Link
            href="/login?redirect=%2Fdashboard%2Ffunding"
            className="inline-flex rounded-full bg-accent px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-black/20 transition hover:bg-accent/90"
          >
            Explore funding tools
          </Link>
        </div>
      </div>
    </section>
  );
}
