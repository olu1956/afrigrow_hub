export type VerificationRequestStatus = "pending" | "approved" | "rejected";

export type VerificationRequest = {
  id: string;
  business_id: string;
  user_id: string;
  registration_number: string;
  website: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  notes: string;
  document_path: string;
  document_name: string;
  status: VerificationRequestStatus;
  admin_note: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export const VERIFICATION_REQUESTS_TABLE = "verification_requests" as const;
