function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function formatRelativeFollowUp(nextFollowUp: string | null): string {
  if (!nextFollowUp) return "Not scheduled";

  const target = startOfDay(new Date(nextFollowUp));
  const today = startOfDay(new Date());
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays <= 14) return "Next week";

  return target.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: target.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export function formatRelativeCreatedAt(createdAt: string): string {
  const created = startOfDay(new Date(createdAt));
  const today = startOfDay(new Date());
  const diffDays = Math.round((today.getTime() - created.getTime()) / 86_400_000);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return new Date(createdAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isFollowUpDueDate(nextFollowUp: string | null): boolean {
  if (!nextFollowUp) return false;

  const label = formatRelativeFollowUp(nextFollowUp);
  return label === "Today" || label === "Overdue" || label === "Tomorrow";
}

export function defaultNextFollowUpDate(daysFromNow = 3): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(9, 0, 0, 0);
  return date.toISOString();
}
