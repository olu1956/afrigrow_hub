import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import type { GuideView } from "@/lib/learning/guide-mapper";
import { isGuideFeaturedNow } from "@/lib/learning/guide-mapper";

type GuideCardProps = {
  guide: GuideView;
};

export function GuideCard({ guide }: GuideCardProps) {
  const featured = isGuideFeaturedNow(guide);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary/25 hover:shadow-md">
      <div className="border-b border-border bg-primary-light/40 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {guide.topicLabel}
          </span>
          {featured ? (
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Featured
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 text-lg font-bold leading-snug text-foreground">{guide.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted">{guide.summary}</p>
      </div>

      <div className="flex flex-1 flex-col px-5 py-4">
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {guide.author}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {guide.readTimeMinutes} min read
          </span>
        </div>

        <Link
          href={`/learn/${guide.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Read guide
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="bg-primary-dark px-5 py-3 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-white">
          Free · AfriGrow members
        </p>
      </div>
    </article>
  );
}
