export function isMissingTrainingTableError(message: string): boolean {
  return /training_|schema cache|relation .* does not exist/i.test(message);
}

export function isMissingTrainingLmsError(message: string): boolean {
  return (
    /training_lessons|training_lesson_progress|set_training_session_attendance|refresh_training_enrollment|complete_own_training_enrollment|self_completed/i.test(
      message,
    ) ||
    (/attended/i.test(message) && /training_enrollments/i.test(message))
  );
}

export function formatTrainingDbError(message: string): string {
  if (isMissingTrainingLmsError(message)) {
    if (/complete_own_training_enrollment|self_completed/i.test(message)) {
      return "Run supabase/scripts/setup_training_mark_complete.sql in the Supabase SQL Editor, then refresh this page.";
    }
    return "Run supabase/scripts/setup_training_lms_layer_a.sql in the Supabase SQL Editor, then refresh this page.";
  }

  if (isMissingTrainingTableError(message)) {
    return "Run migration 20260708150000_create_training_portal.sql in Supabase SQL Editor, then refresh this page.";
  }

  if (message.includes("trainee_name") || message.includes("trainee_email")) {
    return "Run migration 20260708160000_training_enrollment_contact_details.sql in Supabase SQL Editor, then refresh this page.";
  }

  if (message.includes("flyer_image_url") || /training-flyers/i.test(message)) {
    return "Run migration 20260820120000_training_course_flyer.sql in Supabase SQL Editor, then refresh this page.";
  }

  return message;
}
