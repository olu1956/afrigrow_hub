import { JoinNowButton } from "@/components/landing/JoinNowButton";

type DemoJoinCtaProps = {
  reason?: string;
};

export function DemoJoinCta({
  reason = "Create a free account to use this for your own business. Nothing in the demo is saved.",
}: DemoJoinCtaProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary-light/50 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm leading-relaxed text-foreground">{reason}</p>
      <JoinNowButton size="sm" href="/signup" className="shrink-0" />
    </div>
  );
}
