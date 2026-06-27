import { getPlanById, type PlanId } from "@/lib/billing-data";
import type { Subscription, SubscriptionStatus } from "@/lib/database/subscriptions";

export type SubscriptionView = {
  id: string;
  planId: PlanId;
  planName: string;
  status: SubscriptionStatus;
  provider: Subscription["provider"];
  providerCustomerId: string;
  createdAt: string;
};

export function mapSubscription(row: Subscription): SubscriptionView {
  return {
    id: row.id,
    planId: row.plan,
    planName: getPlanById(row.plan).name,
    status: row.status,
    provider: row.provider,
    providerCustomerId: row.provider_customer_id,
    createdAt: row.created_at,
  };
}

export function subscriptionStatusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "trialing":
      return "Trial";
    case "cancelled":
      return "Cancelled";
    case "past_due":
      return "Past due";
    case "incomplete":
      return "Incomplete";
    default:
      return status;
  }
}
