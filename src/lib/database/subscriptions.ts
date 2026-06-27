import type { PlanId } from "@/lib/billing-data";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "cancelled"
  | "past_due"
  | "incomplete";

export type SubscriptionProvider = "stripe" | "paypal" | "manual" | "preview";

export type Subscription = {
  id: string;
  user_id: string;
  plan: PlanId;
  status: SubscriptionStatus;
  provider: SubscriptionProvider;
  provider_customer_id: string;
  created_at: string;
};

export type SubscriptionInsert = Pick<Subscription, "user_id" | "plan"> &
  Partial<Pick<Subscription, "status" | "provider" | "provider_customer_id">>;

export type SubscriptionUpdate = Partial<
  Pick<Subscription, "plan" | "status" | "provider" | "provider_customer_id">
>;

export const SUBSCRIPTIONS_TABLE = "subscriptions" as const;

export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  "active",
  "trialing",
  "cancelled",
  "past_due",
  "incomplete",
];

export const SUBSCRIPTION_PROVIDERS: SubscriptionProvider[] = [
  "stripe",
  "paypal",
  "manual",
  "preview",
];

export const SUBSCRIPTION_PLANS: PlanId[] = ["starter", "growth", "enterprise"];
