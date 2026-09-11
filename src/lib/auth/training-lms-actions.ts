"use server";

import { revalidatePath } from "next/cache";
import { isPlatformAdminUser } from "@/lib/auth/admin-access";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { formatTrainingDbError } from "@/lib/training/db-errors";
import {
  TRAINING_COURSES_TABLE,
  type TrainingCourse,
} from "@/lib/database/training-courses";
import {
  TRAINING_ENROLLMENTS_TABLE,
  type TrainingEnrollment,
} from "@/lib/database/training-enrollments";
import { TRAINING_LESSON_PROGRESS_TABLE } from "@/lib/database/training-lesson-progress";
import {
  TRAINING_LESSONS_TABLE,
  type TrainingLesson,
} from "@/lib/database/training-lessons";
import {
  TRAINING_PROVIDERS_TABLE,
  type TrainingProvider,
} from "@/lib/database/training-providers";
import {
  TRAINING_SESSIONS_TABLE,
  type TrainingSession,
} from "@/lib/database/training-sessions";
import { createClient } from "@/lib/supabase/server";
import {
  demoTrainingCertificate,
  isActiveEnrollmentStatus,
  type TrainingCertificateView,
} from "@/lib/training-data";
import { validateOptionalLessonVideoUrl } from "@/lib/training/video-embed";

export type TrainingLmsActionResult = {
  ok: boolean;
  error?: string;
};

export type TrainingCertificateResult = TrainingLmsActionResult & {
  certificate?: TrainingCertificateView;
};

function lmsSetupError(message: string): string {
  return formatTrainingDbError(message);
}

function revalidateTraining(): void {
  revalidatePath("/dashboard/training");
}

async function assertOwnCourse(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  courseId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data, error } = await supabase
    .from(TRAINING_COURSES_TABLE)
    .select("id")
    .eq("id", courseId)
    .eq("provider_user_id", userId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: lmsSetupError(error.message) };
  }
  if (!data) {
    return { ok: false, error: "Course not found or you are not the provider." };
  }
  return { ok: true };
}

export async function createLessonAction(input: {
  courseId: string;
  title: string;
  notes?: string;
  videoUrl?: string;
  sortOrder?: number;
}): Promise<TrainingLmsActionResult & { lessonId?: string }> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, lessonId: `demo-lesson-${Date.now()}` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Module title is required." };
  }

  const videoError = validateOptionalLessonVideoUrl(input.videoUrl ?? "");
  if (videoError) {
    return { ok: false, error: videoError };
  }

  const owned = await assertOwnCourse(supabase, user.id, input.courseId);
  if (!owned.ok) return owned;

  let sortOrder = input.sortOrder;
  if (sortOrder === undefined || Number.isNaN(sortOrder)) {
    const { data: last } = await supabase
      .from(TRAINING_LESSONS_TABLE)
      .select("sort_order")
      .eq("course_id", input.courseId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = ((last as { sort_order?: number } | null)?.sort_order ?? -1) + 1;
  }

  const { data, error } = await supabase
    .from(TRAINING_LESSONS_TABLE)
    .insert({
      course_id: input.courseId,
      title,
      notes: input.notes?.trim() ?? "",
      video_url: input.videoUrl?.trim() ?? "",
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: lmsSetupError(error.message) };
  }

  revalidateTraining();
  return { ok: true, lessonId: (data as { id: string }).id };
}

export async function updateLessonAction(input: {
  lessonId: string;
  title?: string;
  notes?: string;
  videoUrl?: string;
  sortOrder?: number;
}): Promise<TrainingLmsActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: lesson, error: lessonError } = await supabase
    .from(TRAINING_LESSONS_TABLE)
    .select("*")
    .eq("id", input.lessonId)
    .maybeSingle();

  if (lessonError) {
    return { ok: false, error: lmsSetupError(lessonError.message) };
  }
  if (!lesson) {
    return { ok: false, error: "Module not found." };
  }

  const owned = await assertOwnCourse(supabase, user.id, (lesson as TrainingLesson).course_id);
  if (!owned.ok) return owned;

  if (input.videoUrl !== undefined) {
    const videoError = validateOptionalLessonVideoUrl(input.videoUrl);
    if (videoError) {
      return { ok: false, error: videoError };
    }
  }

  const updates: Record<string, string | number> = {};
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) {
      return { ok: false, error: "Module title is required." };
    }
    updates.title = title;
  }
  if (input.notes !== undefined) updates.notes = input.notes.trim();
  if (input.videoUrl !== undefined) updates.video_url = input.videoUrl.trim();
  if (input.sortOrder !== undefined && !Number.isNaN(input.sortOrder)) {
    updates.sort_order = input.sortOrder;
  }

  const { error } = await supabase
    .from(TRAINING_LESSONS_TABLE)
    .update(updates)
    .eq("id", input.lessonId);

  if (error) {
    return { ok: false, error: lmsSetupError(error.message) };
  }

  revalidateTraining();
  return { ok: true };
}

export async function deleteLessonAction(lessonId: string): Promise<TrainingLmsActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: lesson, error: lessonError } = await supabase
    .from(TRAINING_LESSONS_TABLE)
    .select("id, course_id")
    .eq("id", lessonId)
    .maybeSingle();

  if (lessonError) {
    return { ok: false, error: lmsSetupError(lessonError.message) };
  }
  if (!lesson) {
    return { ok: false, error: "Module not found." };
  }

  const owned = await assertOwnCourse(supabase, user.id, (lesson as TrainingLesson).course_id);
  if (!owned.ok) return owned;

  const { error } = await supabase.from(TRAINING_LESSONS_TABLE).delete().eq("id", lessonId);
  if (error) {
    return { ok: false, error: lmsSetupError(error.message) };
  }

  revalidateTraining();
  return { ok: true };
}

export async function toggleLessonCompleteAction(
  lessonId: string,
  completed: boolean,
): Promise<TrainingLmsActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: lesson, error: lessonError } = await supabase
    .from(TRAINING_LESSONS_TABLE)
    .select("id, course_id")
    .eq("id", lessonId)
    .maybeSingle();

  if (lessonError) {
    return { ok: false, error: lmsSetupError(lessonError.message) };
  }
  if (!lesson) {
    return { ok: false, error: "Module not found." };
  }

  const { data: enrollmentRows, error: enrollError } = await supabase
    .from(TRAINING_ENROLLMENTS_TABLE)
    .select("id, status")
    .eq("user_id", user.id)
    .eq("course_id", (lesson as TrainingLesson).course_id)
    .in("status", ["enrolled", "completed"])
    .limit(1);

  if (enrollError) {
    return { ok: false, error: lmsSetupError(enrollError.message) };
  }

  const enrollment = (enrollmentRows ?? [])[0] as Pick<TrainingEnrollment, "id" | "status"> | undefined;
  if (!enrollment || !isActiveEnrollmentStatus(enrollment.status)) {
    return { ok: false, error: "Enroll in this course before marking modules complete." };
  }

  if (completed) {
    const { error } = await supabase.from(TRAINING_LESSON_PROGRESS_TABLE).insert({
      lesson_id: lessonId,
      user_id: user.id,
    });
    if (error && !/unique|duplicate/i.test(error.message)) {
      return { ok: false, error: lmsSetupError(error.message) };
    }
  } else {
    const { error } = await supabase
      .from(TRAINING_LESSON_PROGRESS_TABLE)
      .delete()
      .eq("lesson_id", lessonId)
      .eq("user_id", user.id);
    if (error) {
      return { ok: false, error: lmsSetupError(error.message) };
    }
  }

  revalidateTraining();
  return { ok: true };
}

export async function setTrainingAttendanceAction(
  enrollmentId: string,
  attended: boolean,
): Promise<TrainingLmsActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { error } = await supabase.rpc("set_training_session_attendance", {
    p_enrollment_id: enrollmentId,
    p_attended: attended,
  });

  if (error) {
    return { ok: false, error: lmsSetupError(error.message) };
  }

  revalidateTraining();
  return { ok: true };
}

export async function markEnrollmentCompleteAction(
  enrollmentId: string,
): Promise<TrainingLmsActionResult> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { error } = await supabase.rpc("complete_own_training_enrollment", {
    p_enrollment_id: enrollmentId,
  });

  if (error) {
    return { ok: false, error: lmsSetupError(error.message) };
  }

  revalidateTraining();
  return { ok: true };
}

export async function getTrainingCertificateAction(
  enrollmentId: string,
): Promise<TrainingCertificateResult> {
  if (!isSupabaseAuthEnabled()) {
    if (enrollmentId === demoTrainingCertificate.enrollmentId) {
      return { ok: true, certificate: demoTrainingCertificate };
    }
    return { ok: false, error: "Certificate not available in preview mode." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: enrollmentRow, error: enrollError } = await supabase
    .from(TRAINING_ENROLLMENTS_TABLE)
    .select("*")
    .eq("id", enrollmentId)
    .maybeSingle();

  if (enrollError) {
    return { ok: false, error: lmsSetupError(enrollError.message) };
  }

  const enrollment = enrollmentRow as TrainingEnrollment | null;
  if (!enrollment) {
    return { ok: false, error: "Enrollment not found." };
  }

  const isAdmin = await isPlatformAdminUser(supabase, user.id, user.email, user);
  if (enrollment.user_id !== user.id && !isAdmin) {
    return { ok: false, error: "You can only view your own certificate." };
  }

  if (enrollment.status !== "completed") {
    return {
      ok: false,
      error: "Certificate is available after all modules and live attendance are complete.",
    };
  }

  const { data: courseRow } = await supabase
    .from(TRAINING_COURSES_TABLE)
    .select("*")
    .eq("id", enrollment.course_id)
    .maybeSingle();
  const course = courseRow as TrainingCourse | null;

  const { data: sessionRow } = await supabase
    .from(TRAINING_SESSIONS_TABLE)
    .select("*")
    .eq("id", enrollment.session_id)
    .maybeSingle();
  const session = sessionRow as TrainingSession | null;

  let providerName = "AfriGrow Hub";
  if (course?.provider_id) {
    const { data: providerRow } = await supabase
      .from(TRAINING_PROVIDERS_TABLE)
      .select("display_name")
      .eq("id", course.provider_id)
      .maybeSingle();
    providerName = (providerRow as TrainingProvider | null)?.display_name?.trim() || providerName;
  }

  return {
    ok: true,
    certificate: {
      enrollmentId: enrollment.id,
      traineeName: enrollment.trainee_name?.trim() || "AfriGrow member",
      courseTitle: course?.title?.trim() || "Training programme",
      sessionTitle: session?.title?.trim() || "",
      completedAt: enrollment.completed_at ?? enrollment.enrolled_at,
      providerName,
    },
  };
}
