import { VERIFICATION_DOCUMENTS_BUCKET } from "@/lib/database/storage";
import { createClient } from "@/lib/supabase/client";

export const VERIFICATION_DOC_MAX_BYTES = 5 * 1024 * 1024;
const VERIFICATION_DOC_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export function validateVerificationDocument(file: File): string | undefined {
  if (!file.size) return "Please choose a document to upload.";
  if (!VERIFICATION_DOC_MIME_TYPES.has(file.type)) {
    return "Use a JPEG, PNG, WebP, or PDF file.";
  }
  if (file.size > VERIFICATION_DOC_MAX_BYTES) {
    return "Document must be 5 MB or smaller.";
  }
  return undefined;
}

export async function uploadVerificationDocumentToStorage(
  file: File,
  userId: string,
): Promise<{ ok: true; path: string; name: string } | { ok: false; error: string }> {
  const validationError = validateVerificationDocument(file);
  if (validationError) return { ok: false, error: validationError };

  const supabase = createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "pdf";
  const safeExt = ["jpg", "jpeg", "png", "webp", "pdf"].includes(extension)
    ? extension
    : "pdf";
  const path = `${userId}/${Date.now()}-evidence.${safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from(VERIFICATION_DOCUMENTS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  return { ok: true, path, name: file.name };
}
