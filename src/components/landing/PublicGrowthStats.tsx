"use client";

import { Eye, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getPublicSiteStatsAction,
  trackSiteVisitAction,
  type PublicSiteStats,
} from "@/lib/auth/public-stats-actions";

function formatCount(value: number): string {
  return value.toLocaleString("en-GB");
}

export function PublicGrowthStats() {
  const [stats, setStats] = useState<PublicSiteStats | null>(null);

  useEffect(() => {
    let active = true;

    void (async () => {
      await trackSiteVisitAction();
      const next = await getPublicSiteStatsAction();
      if (active) {
        setStats(next);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (!stats) {
    return null;
  }

  return (
    <div className="border-b border-border/80 bg-primary-light/40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-12 gap-y-3 px-4 py-5 text-lg text-foreground sm:px-6 sm:text-xl lg:px-8">
        <p className="inline-flex items-center gap-3 font-medium">
          <Eye className="h-6 w-6 shrink-0 text-primary sm:h-7 sm:w-7" aria-hidden />
          <span>
            <span className="text-xl font-bold text-primary sm:text-2xl">
              {formatCount(stats.visitsToday)}
            </span>{" "}
            {stats.visitsToday === 1 ? "visit" : "visits"} today
          </span>
        </p>
        <p className="inline-flex items-center gap-3 font-medium">
          <Users className="h-6 w-6 shrink-0 text-primary sm:h-7 sm:w-7" aria-hidden />
          <span>
            <span className="text-xl font-bold text-primary sm:text-2xl">
              {formatCount(stats.membersCount)}
            </span>{" "}
            {stats.membersCount === 1 ? "member" : "members"} joined
          </span>
        </p>
      </div>
    </div>
  );
}
