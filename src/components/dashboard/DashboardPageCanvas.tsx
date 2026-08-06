import type { LucideIcon } from "lucide-react";

type DashboardPageCanvasProps = {
  children: React.ReactNode;
  variant?: "marketing" | "default";
};

const variantStyles = {
  marketing: {
    base: "from-[#b8ddd0] via-[#cce5dc] to-[#d2e0d9]",
    radial:
      "bg-[radial-gradient(ellipse_120%_80%_at_100%_-20%,rgba(15,107,74,0.28)_0%,transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(201,146,10,0.1)_0%,transparent_45%)]",
    orbPrimary: "bg-primary/35",
    orbAccent: "bg-primary/15",
    dots: "opacity-50 [background-image:radial-gradient(rgba(15,107,74,0.1)_1px,transparent_1px)]",
  },
  default: {
    base: "from-primary-light/80 via-background to-primary-light/30",
    radial:
      "bg-[radial-gradient(ellipse_at_top_right,rgba(15,107,74,0.06)_0%,transparent_50%)]",
    orbPrimary: "bg-primary/10",
    orbAccent: "bg-accent/10",
    dots: "opacity-[0.35] [background-image:radial-gradient(rgba(15,107,74,0.07)_1px,transparent_1px)]",
  },
} as const;

export function DashboardPageCanvas({
  children,
  variant = "default",
}: DashboardPageCanvasProps) {
  const styles = variantStyles[variant];

  return (
    <div className="relative min-h-full sm:min-h-0">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${styles.base}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute inset-0 ${styles.radial}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -right-24 top-8 h-80 w-80 rounded-full ${styles.orbPrimary} blur-3xl`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -left-20 bottom-12 h-72 w-72 rounded-full ${styles.orbAccent} blur-3xl`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute inset-0 [background-size:24px_24px] ${styles.dots}`}
        aria-hidden
      />

      <div className="relative px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</div>
    </div>
  );
}

export const marketingHeroSectionClass =
  "relative -mx-4 -mt-6 mb-2 sm:-mx-6 sm:-mt-8 lg:-mx-8";

export const marketingHeroGradientOverlayClass =
  "pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(143,191,173,0.98)_0%,rgba(181,221,208,0.88)_32%,rgba(196,228,218,0.45)_58%,rgba(210,232,223,0.12)_78%,transparent_100%)]";

export const marketingFieldBorderClass = "border-2 border-[#bcc9c2]";

export const dashboardCardClass =
  "rounded-2xl border border-white/80 bg-card p-5 shadow-lg shadow-primary/10 backdrop-blur-sm";

export const dashboardContentPanelClass = `rounded-2xl ${marketingFieldBorderClass} bg-card p-5 shadow-lg shadow-primary/10 backdrop-blur-sm`;

export const marketingEmptyStateClass = `flex flex-col items-center justify-center rounded-2xl ${marketingFieldBorderClass} bg-white px-6 py-16 text-center shadow-sm shadow-primary/5`;

export const dashboardStatCardClass =
  "flex items-center gap-4 rounded-2xl border border-white/80 bg-card p-4 shadow-md shadow-primary/10 backdrop-blur-sm";

type DashboardStatGridProps = {
  stats: { icon: LucideIcon; label: string; value: string }[];
  columns?: 2 | 3 | 4;
};

export function DashboardStatGrid({ stats, columns = 3 }: DashboardStatGridProps) {
  const columnClass =
    columns === 4
      ? "sm:grid-cols-2 xl:grid-cols-4"
      : columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-3";

  return (
    <div className={`grid gap-4 ${columnClass}`}>
      {stats.map((stat) => (
        <div key={stat.label} className={dashboardStatCardClass}>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
            <stat.icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
