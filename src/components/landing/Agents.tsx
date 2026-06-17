import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
import { agentModules } from "@/lib/dashboard-nav";

export function Agents() {
  return (
    <section
      id="agents"
      className="bg-gradient-to-b from-primary-light/40 to-background px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              AI Agents
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Specialist agents working for your business
            </h2>
            <p className="mt-4 text-lg text-muted">
              Each agent focuses on one job — so you get expert help without
              hiring a full team.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-2 text-sm font-medium text-primary">
            <Bot className="h-4 w-4" />
            6 agents · one dashboard
          </div>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {agentModules.map((agent) => {
            const Icon = agent.icon;
            return (
              <Link
                key={agent.href}
                href={agent.href}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white transition group-hover:bg-primary-dark">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-accent-light px-2.5 py-0.5 text-xs font-semibold text-accent">
                    Phase 1
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {agent.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-primary">{agent.tagline}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {agent.longDescription}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Open agent
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
