import { BUSINESS_LOGOS_BUCKET } from "@/lib/database/storage";
import { createClient } from "@/lib/supabase/client";

export const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const LOGO_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function validateLogoFile(file: File): string | undefined {
  if (!file.size) return "Please choose an image to upload.";
  if (!LOGO_MIME_TYPES.has(file.type)) return "Use JPEG, PNG, WebP, or GIF.";
  if (file.size > LOGO_MAX_BYTES) return "Logo must be 2 MB or smaller.";
  return undefined;
}

export async function uploadBusinessLogoToStorage(
  file: File,
  userId: string,
): Promise<{ ok: true; publicUrl: string } | { ok: false; error: string }> {
  const validationError = validateLogoFile(file);
  if (validationError) return { ok: false, error: validationError };

  const supabase = createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${userId}/logo.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUSINESS_LOGOS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUSINESS_LOGOS_BUCKET).getPublicUrl(path);

  return { ok: true, publicUrl };
}
