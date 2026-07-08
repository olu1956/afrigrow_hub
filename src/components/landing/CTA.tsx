import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FREE_LAUNCH_CTA_LINE } from "@/lib/product-messaging";

export function CTA() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-primary px-8 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white blur-2xl" />
          </div>
          <h2 className="relative text-3xl font-bold text-white sm:text-4xl">
            Become a founding member
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/80">
            Join African and Black-owned SMEs building on AfriGrow Hub before premium
            features launch — promote, connect, and get funding-ready with AI agents.
          </p>
          <p className="relative mx-auto mt-2 max-w-lg text-sm text-white/70">
            {FREE_LAUNCH_CTA_LINE}
          </p>
          <Link
            href="/join"
            className="relative mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-8 py-3.5 text-base font-bold uppercase tracking-wide text-white transition hover:bg-accent/90"
          >
            Join free today
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
