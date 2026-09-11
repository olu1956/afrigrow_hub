"use server";

import { revalidatePath } from "next/cache";
import { isPlatformAdminUser } from "@/lib/auth/admin-access";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import { VERIFICATION_DOCUMENTS_BUCKET } from "@/lib/database/storage";
import {
  VERIFICATION_REQUESTS_TABLE,
  type VerificationRequest,
  type VerificationRequestStatus,
} from "@/lib/database/verification-requests";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type VerificationRequestView = {
  id: string;
  businessId: string;
  registrationNumber: string;
  website: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  notes: string;
  documentPath: string;
  documentName: string;
  status: VerificationRequestStatus;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
};

export type VerificationActionResult = {
  ok: boolean;
  error?: string;
};

export type MyVerificationStatusResult = VerificationActionResult & {
  isVerified: boolean;
  request?: VerificationRequestView | null;
};

function isMissingVerificationTable(message: string): boolean {
  return (
    /verification_requests/i.test(message) &&
    (/does not exist/i.test(message) || /schema cache/i.test(message) || /Could not find/i.test(message))
  );
}

function mapRequest(row: VerificationRequest): VerificationRequestView {
  return {
    id: row.id,
    businessId: row.business_id,
    registrationNumber: row.registration_number ?? "",
    website: row.website ?? "",
    instagram: row.instagram ?? "",
    facebook: row.facebook ?? "",
    linkedin: row.linkedin ?? "",
    notes: row.notes ?? "",
    documentPath: row.document_path ?? "",
    documentName: row.document_name ?? "",
    status: row.status,
    adminNote: row.admin_note ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reviewedAt: row.reviewed_at,
  };
}

function setupWarning(): string {
  return "Verification requests are not set up yet. Run supabase/scripts/setup_member_privacy_and_verification.sql in the Supabase SQL Editor.";
}

function trimField(value: string | undefined, max: number): string {
  return (value ?? "").trim().slice(0, max);
}

function hasOnlinePresence(input: {
  website: string;
  instagram: string;
  facebook: string;
  linkedin: string;
}): boolean {
  return Boolean(input.website || input.instagram || input.facebook || input.linkedin);
}

export async function getMyVerificationStatusAction(): Promise<MyVerificationStatusResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, isVerified: false, request: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, isVerified: false, error: "Not signed in." };
  }

  const { data: business, error: businessError } = await supabase
    .from(BUSINESSES_TABLE)
    .select("id, is_verified")
    .eq("user_id", user.id)
    .maybeSingle();

  if (businessError) {
    return { ok: false, isVerified: false, error: businessError.message };
  }

  const isVerified = Boolean(business?.is_verified);
  if (!business) {
    return { ok: true, isVerified: false, request: null };
  }

  const { data, error } = await supabase
    .from(VERIFICATION_REQUESTS_TABLE)
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingVerificationTable(error.message)) {
      return { ok: true, isVerified, request: null };
    }
    return { ok: false, isVerified, error: error.message };
  }

  return {
    ok: true,
    isVerified,
    request: data ? mapRequest(data as VerificationRequest) : null,
  };
}

export async function submitVerificationRequestAction(input: {
  registrationNumber: string;
  website: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  notes: string;
  documentPath?: string;
  documentName?: string;
}): Promise<VerificationActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const registrationNumber = trimField(input.registrationNumber, 80);
  const website = trimField(input.website, 200);
  const instagram = trimField(input.instagram, 120);
  const facebook = trimField(input.facebook, 200);
  const linkedin = trimField(input.linkedin, 200);
  const notes = trimField(input.notes, 800);
  const documentPath = trimField(input.documentPath, 400);
  const documentName = trimField(input.documentName, 200);

  if (registrationNumber.length < 3) {
    return { ok: false, error: "Enter your business registration number." };
  }
  if (!hasOnlinePresence({ website, instagram, facebook, linkedin })) {
    return {
      ok: false,
      error: "Add a website or at least one social profile so we can check the business.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data: business, error: businessError } = await supabase
    .from(BUSINESSES_TABLE)
    .select("id, is_verified")
    .eq("user_id", user.id)
    .maybeSingle();

  if (businessError || !business) {
    return { ok: false, error: businessError?.message ?? "Business profile not found. Save your profile first." };
  }

  if (business.is_verified) {
    return { ok: false, error: "This business is already verified." };
  }

  const payload = {
    business_id: business.id,
    user_id: user.id,
    registration_number: registrationNumber,
    website,
    instagram,
    facebook,
    linkedin,
    notes,
    document_path: documentPath,
    document_name: documentName,
    status: "pending" as const,
    admin_note: "",
    reviewed_by: null,
    reviewed_at: null,
  };

  const { data: pending, error: pendingError } = await supabase
    .from(VERIFICATION_REQUESTS_TABLE)
    .select("id")
    .eq("business_id", business.id)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingError) {
    if (isMissingVerificationTable(pendingError.message)) {
      return { ok: false, error: setupWarning() };
    }
    return { ok: false, error: pendingError.message };
  }

  if (pending) {
    const { error } = await supabase
      .from(VERIFICATION_REQUESTS_TABLE)
      .update(payload)
      .eq("id", pending.id)
      .eq("user_id", user.id);

    if (error) {
      return { ok: false, error: error.message };
    }
  } else {
    const { error } = await supabase.from(VERIFICATION_REQUESTS_TABLE).insert(payload);
    if (error) {
      if (isMissingVerificationTable(error.message)) {
        return { ok: false, error: setupWarning() };
      }
      return { ok: false, error: error.message };
    }
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/admin/directory");
  return { ok: true };
}

export async function getVerificationDocumentUrlAction(input: {
  documentPath: string;
}): Promise<VerificationActionResult & { url?: string }> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const documentPath = input.documentPath.trim();
  if (!documentPath) {
    return { ok: false, error: "No document uploaded." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const isAdmin = await isPlatformAdminUser(supabase, user.id, user.email, user);
  const ownsPath = documentPath.startsWith(`${user.id}/`);
  if (!isAdmin && !ownsPath) {
    return { ok: false, error: "You do not have access to this document." };
  }

  const adminClient = createAdminClient();
  const storageClient = isAdmin && adminClient ? adminClient : supabase;
  const { data, error } = await storageClient.storage
    .from(VERIFICATION_DOCUMENTS_BUCKET)
    .createSignedUrl(documentPath, 60);

  if (error || !data?.signedUrl) {
    return { ok: false, error: error?.message ?? "Could not open the document." };
  }

  return { ok: true, url: data.signedUrl };
}

export async function reviewVerificationRequestAction(input: {
  requestId: string;
  approved: boolean;
  adminNote?: string;
}): Promise<VerificationActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const isAdmin = await isPlatformAdminUser(supabase, user.id, user.email, user);
  if (!isAdmin) {
    return { ok: false, error: "You do not have access to this admin area." };
  }

  const requestId = input.requestId.trim();
  if (!requestId) {
    return { ok: false, error: "Missing request id." };
  }

  const adminNote = trimField(input.adminNote, 400);
  if (!input.approved && adminNote.length < 3) {
    return { ok: false, error: "Add a short reason so the member knows what to fix." };
  }

  const { error: rpcError } = await supabase.rpc("admin_review_verification_request", {
    p_request_id: requestId,
    p_approved: input.approved,
    p_admin_note: adminNote,
  });

  if (rpcError) {
    if (isMissingVerificationTable(rpcError.message) || /Could not find the function/i.test(rpcError.message)) {
      return { ok: false, error: setupWarning() };
    }
    return { ok: false, error: rpcError.message };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/directory");
  revalidatePath("/dashboard/admin/directory");
  revalidatePath("/dashboard/matching");
  return { ok: true };
}

export async function listPendingVerificationRequestsAction(): Promise<
  VerificationActionResult & { requests?: VerificationRequestView[] }
> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, requests: [] };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const isAdmin = await isPlatformAdminUser(supabase, user.id, user.email, user);
  if (!isAdmin) {
    return { ok: false, error: "You do not have access to this admin area." };
  }

  const queryClient = createAdminClient() ?? supabase;
  const { data, error } = await queryClient
    .from(VERIFICATION_REQUESTS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingVerificationTable(error.message)) {
      return { ok: true, requests: [] };
    }
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    requests: ((data ?? []) as VerificationRequest[]).map(mapRequest),
  };
}
