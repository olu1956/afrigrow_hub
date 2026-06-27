import Image from "next/image";
import Link from "next/link";
import type { LabeledPartner } from "@/lib/landing/funding-partners";

type LabeledPartnerStripProps = {
  partners: LabeledPartner[];
  title?: string;
};

export function LabeledPartnerStrip({
  partners,
  title = "Working with partners across Africa",
}: LabeledPartnerStripProps) {
  return (
    <section className="border-y border-border bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {title ? (
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {title}
          </p>
        ) : null}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map((partner) => {
            const content = (
              <div className="flex flex-col items-center text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {partner.label}
                </p>
                <div className="mt-4 flex h-20 w-full max-w-[200px] items-center justify-center rounded-lg border border-border bg-background px-4 py-3">
                  <Image
                    src={partner.logoSrc}
                    alt={partner.name}
                    width={160}
                    height={64}
                    className="max-h-14 w-auto max-w-full object-contain"
                  />
                </div>
                <p className="mt-3 text-xs font-medium text-foreground/80">{partner.name}</p>
              </div>
            );

            if (partner.href) {
              return (
                <Link
                  key={partner.id}
                  href={partner.href}
                  className="transition hover:opacity-80"
                >
                  {content}
                </Link>
              );
            }

            return <div key={partner.id}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
