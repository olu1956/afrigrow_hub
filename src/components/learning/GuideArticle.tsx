import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react";
import { GuideBody } from "@/components/learning/GuideBody";
import type { GuideView } from "@/lib/learning/guide-mapper";
import { isGuideFeaturedNow } from "@/lib/learning/guide-mapper";

type GuideArticleProps = {
  guide: GuideView;
};

export function GuideArticle({ guide }: GuideArticleProps) {
  return (
    <article className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/initiatives/business-academy"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Business Academy
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            {guide.topicLabel}
          </span>
          {isGuideFeaturedNow(guide) ? (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Featured
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3.5 w-3.5" />
            {guide.readTimeMinutes} min read
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <BookOpen className="h-3.5 w-3.5" />
            {guide.author}
          </span>
        </div>

        <h1 className="mt-5 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          {guide.title}
        </h1>
        <p className="mt-4 text-lg text-muted">{guide.summary}</p>
        <p className="mt-2 text-xs uppercase tracking-wider text-muted">
          {guide.publishedLabel} · Free for AfriGrow members
        </p>

        <div className="mt-10 border-t border-border pt-8">
          <GuideBody body={guide.body} />
        </div>

        {guide.linkedAgentHref && guide.linkedAgentLabel ? (
          <div className="mt-10 rounded-2xl border border-primary/20 bg-primary-light p-6">
            <p className="font-semibold text-foreground">Apply this in AfriGrow</p>
            <p className="mt-2 text-sm text-muted">
              Turn this guide into action using the tools in your dashboard.
            </p>
            <Link
              href={guide.linkedAgentHref}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-dark"
            >
              {guide.linkedAgentLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
