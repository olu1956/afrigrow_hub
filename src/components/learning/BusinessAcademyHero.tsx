import Link from "next/link";
import { BookOpen, GraduationCap } from "lucide-react";
import { EARLY_ACCESS_LABEL } from "@/lib/product-messaging";

export function BusinessAcademyHero() {
  return (
    <section className="border-b border-border bg-[#eceff1]">
      <div className="mx-auto grid max-w-6xl lg:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            <BookOpen className="h-3.5 w-3.5" />
            Guides added regularly
          </p>
          <h1 className="mt-5 text-4xl font-black uppercase leading-none tracking-tight text-primary-dark sm:text-5xl">
            Build a Business Academy
          </h1>
          <p className="mt-4 text-xl font-semibold text-foreground">
            Practical learning for <span className="text-primary">African SMEs</span>
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Short, actionable guides on profile, marketing, CRM, matching, funding, and
            growth — free to read. Apply what you learn in your AfriGrow dashboard.
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted">
            {EARLY_ACCESS_LABEL}
          </p>
        </div>

        <div className="flex flex-col justify-center bg-primary-dark px-4 py-12 text-white sm:px-6 lg:px-8">
          <GraduationCap className="h-10 w-10 text-accent" />
          <blockquote className="mt-6 text-2xl font-serif leading-snug sm:text-3xl">
            Life never stops teaching.
            <span className="block text-accent">Be sure you never stop learning.</span>
          </blockquote>
          <p className="mt-6 text-sm leading-relaxed text-white/80">
            Ongoing learning is essential for any successful business. Use these guides
            alongside your AI agents to turn insight into action.
          </p>
          <Link
            href="/join"
            className="mt-8 inline-flex w-fit rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-accent/90"
          >
            Join free
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-border lg:grid-cols-4">
        {[
          "Learn anywhere, anytime",
          "Practical SME topics",
          "Free member guides",
          "Apply in your dashboard",
        ].map((item) => (
          <div
            key={item}
            className="border-r border-border bg-white px-4 py-4 text-center text-xs font-bold uppercase tracking-wide text-primary-dark last:border-r-0 sm:text-sm"
          >
            ✓ {item}
          </div>
        ))}
      </div>
    </section>
  );
}
