"use client";

import Image from "next/image";
import Link from "next/link";
import type { PartnerLogoEntry } from "@/lib/landing/partner-logos";

type PartnerLogoTileProps = {
  partner: PartnerLogoEntry;
};

function PartnerLogoTile({ partner }: PartnerLogoTileProps) {
  const content = (
    <div className="flex h-[72px] w-[168px] shrink-0 items-center justify-center rounded-lg border border-border bg-white px-4 shadow-sm transition hover:border-primary/25 hover:shadow-md sm:h-20 sm:w-[190px]">
      {partner.src ? (
        <Image
          src={partner.src}
          alt={partner.name}
          width={150}
          height={64}
          className="max-h-14 w-auto max-w-[140px] object-contain"
        />
      ) : (
        <span
          className={`flex h-12 w-full items-center justify-center rounded-md bg-gradient-to-br px-3 text-center text-sm font-bold tracking-wide ${partner.fallbackClass ?? "from-primary to-primary-dark text-white"}`}
        >
          {partner.fallbackLabel ?? partner.name}
        </span>
      )}
    </div>
  );

  if (partner.href) {
    return (
      <Link
        href={partner.href}
        aria-label={`${partner.name} — AfriGrow partner`}
        className="shrink-0"
      >
        {content}
      </Link>
    );
  }

  return <div className="shrink-0">{content}</div>;
}

type PartnerLogoMarqueeProps = {
  partners: PartnerLogoEntry[];
  title?: string;
};

export function PartnerLogoMarquee({
  partners,
  title = "Our partners",
}: PartnerLogoMarqueeProps) {
  const loop = [...partners, ...partners];

  return (
    <section
      aria-label="Partner organisations"
      className="border-y border-border bg-[#eceff1]"
    >
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary-dark sm:text-base">
            {title}
          </p>
          <p className="mt-2 text-sm text-muted">
            Organisations supporting African SMEs on AfriGrow Hub
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden pb-8 motion-reduce:overflow-visible">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-16 bg-gradient-to-r from-[#eceff1] to-transparent motion-reduce:hidden sm:block sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-16 bg-gradient-to-l from-[#eceff1] to-transparent motion-reduce:hidden sm:block sm:w-24" />

        <div className="hidden motion-reduce:flex motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-4 motion-reduce:px-4 motion-reduce:pb-2">
          {partners.map((partner) => (
            <PartnerLogoTile key={partner.id} partner={partner} />
          ))}
        </div>

        <div className="flex w-max animate-partner-marquee items-center gap-5 px-4 hover:[animation-play-state:paused] motion-reduce:hidden sm:gap-6 sm:px-6">
          {loop.map((partner, index) => (
            <PartnerLogoTile key={`${partner.id}-${index}`} partner={partner} />
          ))}
        </div>
      </div>

      <div className="border-t border-border/70 bg-[#eceff1] px-4 pb-8 text-center sm:px-6">
        <Link
          href="/partners/become-a-partner"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Become a partner →
        </Link>
      </div>
    </section>
  );
}
