import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import type { PartnerOffer } from "@/lib/landing/partners-data";

type PartnerOfferCardProps = {
  partner: PartnerOffer;
};

export function PartnerOfferCard({ partner }: PartnerOfferCardProps) {
  const lightCard = partner.cardTheme.includes("slate-100");

  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-border bg-card shadow-md shadow-primary/5">
      <div
        className={`relative flex min-h-[200px] flex-col items-center justify-center bg-gradient-to-br px-5 py-8 text-center ${partner.cardTheme}`}
      >
        {partner.verified ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            <ShieldCheck className="h-3 w-3" />
            Partner
          </span>
        ) : null}

        {partner.logoSrc ? (
          <div className="flex max-h-28 w-full items-center justify-center">
            <Image
              src={partner.logoSrc}
              alt={partner.name}
              width={180}
              height={112}
              className={`max-h-24 w-auto max-w-[170px] object-contain ${lightCard ? "" : "drop-shadow-md"}`}
            />
          </div>
        ) : (
          <p className="text-3xl font-black uppercase tracking-wide text-white">
            {partner.name.split(" ")[0]}
          </p>
        )}

        <p
          className={`mt-4 text-xs font-semibold uppercase tracking-wider ${lightCard ? "text-primary" : "text-white/80"}`}
        >
          {partner.category}
        </p>
      </div>

      <div className="flex flex-1 flex-col px-4 py-5">
        <h2 className="text-base font-bold leading-snug text-foreground">{partner.headline}</h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{partner.description}</p>

        {partner.offer ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary">
            {partner.offer}
          </p>
        ) : null}

        {partner.ctaLabel && partner.ctaHref ? (
          partner.ctaHref.startsWith("http") ? (
            <a
              href={partner.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-fit rounded-md bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-accent/90"
            >
              {partner.ctaLabel}
            </a>
          ) : (
            <Link
              href={partner.ctaHref}
              className="mt-4 inline-flex w-fit rounded-md bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-accent/90"
            >
              {partner.ctaLabel}
            </Link>
          )
        ) : partner.ctaLabel ? (
          <span className="mt-4 inline-flex w-fit rounded-md border border-border bg-background px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted">
            {partner.ctaLabel}
          </span>
        ) : null}
      </div>

      <div className="bg-primary-dark px-4 py-3">
        <p className="text-center text-sm font-bold uppercase tracking-wide text-white">
          {partner.name}
        </p>
      </div>
    </article>
  );
}
