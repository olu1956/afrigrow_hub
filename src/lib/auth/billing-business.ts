import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import type { BillingSender } from "@/lib/mail/billing-document";
import { createClient } from "@/lib/supabase/server";

export async function getBillingSender(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  ownerEmail?: string | null,
): Promise<{ sender: BillingSender; businessId: string } | { error: string }> {
  const { data, error } = await supabase
    .from(BUSINESSES_TABLE)
    .select("id, business_name, email")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!data?.id) {
    return { error: "Business profile not found. Complete your profile first." };
  }

  return {
    businessId: data.id as string,
    sender: {
      businessName: String(data.business_name ?? "").trim(),
      businessEmail: String(data.email ?? "").trim(),
      ownerEmail: ownerEmail?.trim() || undefined,
    },
  };
}
