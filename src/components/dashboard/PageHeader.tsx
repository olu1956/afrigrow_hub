type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "marketing";
};

export function PageHeader({
  title,
  description,
  action,
  variant = "default",
}: PageHeaderProps) {
  const isMarketing = variant === "marketing";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1
          className={`text-2xl font-bold tracking-tight sm:text-3xl ${
            isMarketing ? "text-primary-dark" : "text-foreground"
          }`}
        >
          {title}
        </h1>
        {description && (
          <p
            className={`mt-1.5 max-w-2xl text-sm sm:text-base ${
              isMarketing ? "font-medium text-foreground/85" : "text-muted"
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
