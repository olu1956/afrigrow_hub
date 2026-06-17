import { maxChartValue, type ChartPoint } from "@/lib/analytics-data";

type BarChartProps = {
  title: string;
  points: ChartPoint[];
  color?: string;
};

export function BarChart({
  title,
  points,
  color = "bg-primary",
}: BarChartProps) {
  const max = maxChartValue(points);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <div className="mt-6 flex items-end justify-between gap-2 sm:gap-3">
        {points.map((point) => {
          const height = Math.round((point.value / max) * 100);
          return (
            <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-semibold text-muted sm:text-xs">
                {point.value}
              </span>
              <div className="flex h-28 w-full items-end sm:h-32">
                <div
                  className={`w-full rounded-t-lg ${color} transition-all`}
                  style={{ height: `${height}%` }}
                  role="img"
                  aria-label={`${point.label}: ${point.value}`}
                />
              </div>
              <span className="text-[10px] text-muted sm:text-xs">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
