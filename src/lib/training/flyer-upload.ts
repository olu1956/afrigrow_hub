import { TRAINING_FLYERS_BUCKET } from "@/lib/database/storage";
import { createClient } from "@/lib/supabase/client";

export const FLYER_MAX_BYTES = 5 * 1024 * 1024;
const FLYER_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export function validateFlyerFile(file: File): string | undefined {
  if (!file.size) return "Please choose an image to upload.";
  if (!FLYER_MIME_TYPES.has(file.type)) return "Use JPEG, PNG, WebP, or GIF.";
  if (file.size > FLYER_MAX_BYTES) return "Flyer must be 5 MB or smaller.";
  return undefined;
}

export async function uploadTrainingFlyerToStorage(
  file: File,
  userId: string,
  courseId: string,
): Promise<{ ok: true; publicUrl: string } | { ok: false; error: string }> {
  const validationError = validateFlyerFile(file);
  if (validationError) return { ok: false, error: validationError };

  const supabase = createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${courseId}/flyer.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(TRAINING_FLYERS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(TRAINING_FLYERS_BUCKET).getPublicUrl(path);

  // Bust caches when replacing the same path
  const separator = publicUrl.includes("?") ? "&" : "?";
  return { ok: true, publicUrl: `${publicUrl}${separator}v=${Date.now()}` };
}
