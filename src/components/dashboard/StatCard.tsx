type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
};

export function StatCard({ label, value, change, positive }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      {change && (
        <p
          className={`mt-1 text-xs font-medium ${
            positive ? "text-primary" : "text-muted"
          }`}
        >
          {change}
        </p>
      )}
    </div>
  );
}
