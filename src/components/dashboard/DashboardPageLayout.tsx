import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  marketingHeroGradientOverlayClass,
  marketingHeroSectionClass,
} from "@/components/dashboard/DashboardPageCanvas";

type DashboardPageLayoutProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  heroExtra?: React.ReactNode;
  heroFooter?: React.ReactNode;
  children: React.ReactNode;
};

export function DashboardPageLayout({
  title,
  description,
  action,
  heroExtra,
  heroFooter,
  children,
}: DashboardPageLayoutProps) {
  return (
    <>
      <div className={marketingHeroSectionClass}>
        <div className={marketingHeroGradientOverlayClass} aria-hidden />
        <div className="relative space-y-6 px-4 pb-10 pt-7 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <PageHeader
              variant="marketing"
              title={title}
              description={description}
              action={action}
            />
          </div>

          {heroExtra ? <div className="mx-auto max-w-6xl space-y-3">{heroExtra}</div> : null}

          {heroFooter ? <div className="mx-auto max-w-6xl">{heroFooter}</div> : null}
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6">{children}</div>
    </>
  );
}
