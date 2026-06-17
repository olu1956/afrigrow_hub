import {
  Bot,
  Building2,
  Handshake,
  LineChart,
  Sparkles,
} from "lucide-react";
import { JoinNowButton } from "@/components/landing/JoinNowButton";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-light px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            AI-powered growth for African SMEs
          </div>

          <h1 className="animate-fade-up-delay-1 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Grow your business with{" "}
            <span className="text-primary">intelligent agents</span> built for
            Africa
          </h1>

          <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            AfriGrow Hub helps traders, retailers, manufacturers, and service
            providers create profiles, promote with AI, find partners, prepare
            for funding, and automate customer follow-up — all in one place.
          </p>

          <div className="animate-fade-up-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <JoinNowButton size="lg" href="/signup" className="!rounded-full shadow-lg shadow-accent/30" />
            <a
              href="#agents"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 text-base font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary-light/50"
            >
              Explore AI agents
            </a>
          </div>
        </div>

        <div className="animate-fade-up-delay-3 mx-auto mt-16 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-2 shadow-xl shadow-primary/5">
            <div className="rounded-xl bg-gradient-to-br from-primary-dark to-primary p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">
                    Your growth dashboard
                  </p>
                  <p className="text-xl font-bold text-white sm:text-2xl">
                    Welcome back, Amara&apos;s Textiles
                  </p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  Pro Plan
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Building2, label: "Profile strength", value: "92%" },
                  { icon: LineChart, label: "Marketing reach", value: "+340" },
                  { icon: Handshake, label: "New matches", value: "12" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <stat.icon className="mb-2 h-5 w-5 text-accent" />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <Bot className="h-5 w-5 shrink-0 text-accent" />
                <p className="text-sm text-white/90">
                  <span className="font-semibold text-white">
                    Marketing Agent:
                  </span>{" "}
                  3 social posts ready for your weekend sale. Review & publish →
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
