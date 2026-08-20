"use server";

import { revalidatePath } from "next/cache";
import { isPlatformAdminUser } from "@/lib/auth/admin-access";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import {
  FUNDING_OPPORTUNITIES_TABLE,
  type FundingOpportunityInsert,
  type FundingOpportunityRow,
  type FundingOpportunityStatus,
} from "@/lib/database/funding-opportunities";
import { fundingOpportunities as seedFundingOpportunities } from "@/lib/funding-data";
import type { FundingOpportunityDefinition } from "@/lib/funding-data";
import { parseFundingOpportunitiesCsv } from "@/lib/funding/csv-import";
import {
  definitionToInsert,
  mergeFundingCatalogue,
  publishedSeedCatalogue,
} from "@/lib/funding/opportunity-mapper";
import { createClient } from "@/lib/supabase/server";

export type FundingCatalogueActionResult = {
  ok: boolean;
  error?: string;
  warning?: string;
  imported?: number;
};

export type FundingCatalogueListResult = FundingCatalogueActionResult & {
  opportunities?: FundingOpportunityDefinition[];
  rows?: FundingOpportunityRow[];
};

function isMissingTableError(message: string): boolean {
  return (
    /relation ["']?public\.funding_opportunities["']? does not exist/i.test(message) ||
    /Could not find the table ['"]public\.funding_opportunities['"] in the schema cache/i.test(
      message,
    )
  );
}

async function assertPlatformAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "You must be logged in." };
  }

  const isAdmin = await isPlatformAdminUser(supabase, user.id, user.email, user);
  if (!isAdmin) {
    return { ok: false as const, error: "You do not have access to this admin area." };
  }

  return { ok: true as const, supabase };
}

function revalidateFundingPaths() {
  revalidatePath("/dashboard/funding");
  revalidatePath("/dashboard/admin/funding");
}

export async function getPublishedFundingCatalogueAction(): Promise<FundingCatalogueListResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, opportunities: publishedSeedCatalogue() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(FUNDING_OPPORTUNITIES_TABLE)
    .select("*")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) {
      return {
        ok: true,
        opportunities: publishedSeedCatalogue(),
        warning:
          "Using built-in funding list. Run migration 20260820220000_create_funding_opportunities.sql to enable the live catalogue.",
      };
    }
    return {
      ok: false,
      error: error.message,
      opportunities: publishedSeedCatalogue(),
    };
  }

  const rows = (data ?? []) as FundingOpportunityRow[];
  if (rows.length === 0) {
    return {
      ok: true,
      opportunities: publishedSeedCatalogue(),
      warning:
        "No published programmes in the database yet — showing built-in list. Seed or upload from Admin → Funding catalogue.",
    };
  }

  return {
    ok: true,
    opportunities: mergeFundingCatalogue(seedFundingOpportunities, rows),
  };
}

export async function getAdminFundingOpportunitiesAction(): Promise<FundingCatalogueListResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase auth is not configured." };
  }

  const gate = await assertPlatformAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const { data, error } = await gate.supabase
    .from(FUNDING_OPPORTUNITIES_TABLE)
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) {
      return {
        ok: false,
        error:
          "Run migration 20260820220000_create_funding_opportunities.sql in Supabase SQL Editor first.",
        rows: [],
      };
    }
    return { ok: false, error: error.message, rows: [] };
  }

  return { ok: true, rows: (data ?? []) as FundingOpportunityRow[] };
}

export async function upsertFundingOpportunityAction(
  input: FundingOpportunityInsert,
): Promise<FundingCatalogueActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase auth is not configured." };
  }

  const gate = await assertPlatformAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const id = input.id.trim();
  const name = input.name.trim();
  if (!id || !name) {
    return { ok: false, error: "id and name are required." };
  }
  if (!input.country_keys?.length) {
    return { ok: false, error: "At least one country key is required." };
  }

  const payload = {
    ...input,
    id,
    name,
    provider: input.provider?.trim() ?? "",
    country_keys: input.country_keys.map((k) => k.trim().toLowerCase()).filter(Boolean),
    updated_at: new Date().toISOString(),
  };

  const { error } = await gate.supabase.from(FUNDING_OPPORTUNITIES_TABLE).upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    return {
      ok: false,
      error: isMissingTableError(error.message)
        ? "Run migration 20260820220000_create_funding_opportunities.sql in Supabase SQL Editor first."
        : error.message,
    };
  }

  revalidateFundingPaths();
  return { ok: true };
}

export async function updateFundingOpportunityStatusAction(input: {
  id: string;
  status: FundingOpportunityStatus;
}): Promise<FundingCatalogueActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase auth is not configured." };
  }

  const gate = await assertPlatformAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const { error } = await gate.supabase
    .from(FUNDING_OPPORTUNITIES_TABLE)
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq("id", input.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateFundingPaths();
  return { ok: true };
}

export async function deleteFundingOpportunityAction(
  id: string,
): Promise<FundingCatalogueActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase auth is not configured." };
  }

  const gate = await assertPlatformAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const { error } = await gate.supabase
    .from(FUNDING_OPPORTUNITIES_TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateFundingPaths();
  return { ok: true };
}

export async function importFundingOpportunitiesCsvAction(
  csvText: string,
): Promise<FundingCatalogueActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase auth is not configured." };
  }

  const gate = await assertPlatformAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const parsed = parseFundingOpportunitiesCsv(csvText);
  if (parsed.errors.length > 0 && parsed.rows.length === 0) {
    return { ok: false, error: parsed.errors.join(" ") };
  }
  if (parsed.rows.length === 0) {
    return { ok: false, error: "No valid rows found in the CSV." };
  }

  const now = new Date().toISOString();
  const payload = parsed.rows.map((row) => ({ ...row, updated_at: now }));

  const { error } = await gate.supabase.from(FUNDING_OPPORTUNITIES_TABLE).upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    return {
      ok: false,
      error: isMissingTableError(error.message)
        ? "Run migration 20260820220000_create_funding_opportunities.sql in Supabase SQL Editor first."
        : error.message,
    };
  }

  revalidateFundingPaths();
  return {
    ok: true,
    imported: parsed.rows.length,
    warning: parsed.errors.length > 0 ? parsed.errors.join(" ") : undefined,
  };
}

export async function seedFundingOpportunitiesAction(): Promise<FundingCatalogueActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase auth is not configured." };
  }

  const gate = await assertPlatformAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const now = new Date().toISOString();
  const payload = seedFundingOpportunities.map((def) => ({
    ...definitionToInsert(def, "published"),
    updated_at: now,
  }));

  const { error } = await gate.supabase.from(FUNDING_OPPORTUNITIES_TABLE).upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    return {
      ok: false,
      error: isMissingTableError(error.message)
        ? "Run migration 20260820220000_create_funding_opportunities.sql in Supabase SQL Editor first."
        : error.message,
    };
  }

  revalidateFundingPaths();
  return { ok: true, imported: payload.length };
}
