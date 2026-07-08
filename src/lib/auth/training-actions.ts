"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseAuthEnabled } from "@/lib/auth/config";
import { BUSINESSES_TABLE } from "@/lib/database/businesses";
import { USERS_PROFILE_TABLE } from "@/lib/database/users-profile";
import {
  TRAINING_COURSES_TABLE,
  type TrainingCourse,
} from "@/lib/database/training-courses";
import {
  TRAINING_ENROLLMENTS_TABLE,
  type TrainingEnrollment,
} from "@/lib/database/training-enrollments";
import {
  TRAINING_PROVIDERS_TABLE,
  type TrainingProvider,
} from "@/lib/database/training-providers";
import {
  TRAINING_SESSIONS_TABLE,
  type TrainingSession,
} from "@/lib/database/training-sessions";
import {
  demoMyEnrollments,
  demoTrainingCourses,
  type TrainingCourseView,
  type TrainingEnrollmentPrefill,
  type TrainingEnrollmentView,
  type TrainingProviderView,
  type ProviderEnrollmentRosterEntry,
  type TrainingSessionView,
} from "@/lib/training-data";
import { createClient } from "@/lib/supabase/server";

export type TrainingActionResult = {
  ok: boolean;
  error?: string;
  warning?: string;
};

export type TrainingPortalDataResult = TrainingActionResult & {
  catalog?: TrainingCourseView[];
  myEnrollments?: TrainingEnrollmentView[];
  provider?: TrainingProviderView | null;
  providerCourses?: TrainingCourseView[];
  providerRoster?: ProviderEnrollmentRosterEntry[];
  enrollmentPrefill?: TrainingEnrollmentPrefill;
  isProvider?: boolean;
};

function isMissingTrainingTableError(message: string): boolean {
  return /training_|schema cache|relation .* does not exist/i.test(message);
}

function formatTrainingDbError(message: string): string {
  if (isMissingTrainingTableError(message)) {
    return "Run migration 20260708150000_create_training_portal.sql in Supabase SQL Editor, then refresh this page.";
  }

  if (message.includes("trainee_name") || message.includes("trainee_email")) {
    return "Run migration 20260708160000_training_enrollment_contact_details.sql in Supabase SQL Editor, then refresh this page.";
  }

  return message;
}

async function getEnrollmentPrefill(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  userEmail: string,
): Promise<TrainingEnrollmentPrefill> {
  const [{ data: profile }, { data: business }] = await Promise.all([
    supabase.from(USERS_PROFILE_TABLE).select("full_name, email").eq("user_id", userId).maybeSingle(),
    supabase
      .from(BUSINESSES_TABLE)
      .select("business_name, email, whatsapp")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return {
    traineeName: profile?.full_name?.trim() || "",
    traineeEmail: business?.email?.trim() || profile?.email?.trim() || userEmail,
    traineePhone: business?.whatsapp?.trim() || "",
    traineeBusiness: business?.business_name?.trim() || "",
  };
}

async function getUserBusinessId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ businessId: string | null; businessName: string; error?: string }> {
  const { data, error } = await supabase
    .from(BUSINESSES_TABLE)
    .select("id, business_name")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { businessId: null, businessName: "", error: error.message };
  }

  return {
    businessId: data?.id ?? null,
    businessName: data?.business_name ?? "",
  };
}

function buildSessionView(
  session: TrainingSession,
  enrollmentCount: number,
  userEnrollment: TrainingEnrollment | undefined,
): TrainingSessionView {
  return {
    id: session.id,
    courseId: session.course_id,
    title: session.title,
    startsAt: session.starts_at,
    endsAt: session.ends_at,
    zoomUrl: session.zoom_url,
    maxSeats: session.max_seats,
    status: session.status,
    enrollmentCount,
    isEnrolled: userEnrollment?.status === "enrolled",
    enrollmentId: userEnrollment?.id ?? null,
  };
}

function buildCourseView(
  course: TrainingCourse,
  providerName: string,
  sessions: TrainingSessionView[],
): TrainingCourseView {
  return {
    id: course.id,
    title: course.title,
    summary: course.summary,
    description: course.description,
    status: course.status,
    providerName,
    sessions,
  };
}

function buildEnrollmentView(
  enrollment: TrainingEnrollment,
  course: TrainingCourse,
  session: TrainingSession,
): TrainingEnrollmentView {
  return {
    id: enrollment.id,
    courseId: course.id,
    courseTitle: course.title,
    sessionId: session.id,
    sessionTitle: session.title,
    startsAt: session.starts_at,
    zoomUrl: session.zoom_url,
    status: enrollment.status,
    enrolledAt: enrollment.enrolled_at,
    traineeName: enrollment.trainee_name ?? "",
    traineeEmail: enrollment.trainee_email ?? "",
  };
}

async function fetchProviderForUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<TrainingProvider | null> {
  const { data, error } = await supabase
    .from(TRAINING_PROVIDERS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingTrainingTableError(error.message)) {
      throw new Error(formatTrainingDbError(error.message));
    }
    throw new Error(error.message);
  }

  return (data as TrainingProvider | null) ?? null;
}

export async function getTrainingPortalDataAction(): Promise<TrainingPortalDataResult> {
  if (!isSupabaseAuthEnabled()) {
    return {
      ok: true,
      catalog: demoTrainingCourses,
      myEnrollments: demoMyEnrollments,
      provider: null,
      providerCourses: [],
      providerRoster: [],
      enrollmentPrefill: {
        traineeName: "Demo User",
        traineeEmail: "demo@example.com",
        traineePhone: "",
        traineeBusiness: "Demo Business",
      },
      isProvider: false,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  try {
    const provider = await fetchProviderForUser(supabase, user.id);

    const { data: publishedCourses, error: coursesError } = await supabase
      .from(TRAINING_COURSES_TABLE)
      .select("*")
      .eq("status", "published")
      .order("updated_at", { ascending: false });

    if (coursesError) {
      return { ok: false, error: formatTrainingDbError(coursesError.message) };
    }

    const { data: myEnrollmentsRaw, error: enrollError } = await supabase
      .from(TRAINING_ENROLLMENTS_TABLE)
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "enrolled")
      .order("enrolled_at", { ascending: false });

    if (enrollError) {
      return { ok: false, error: formatTrainingDbError(enrollError.message) };
    }

    const myEnrollments = (myEnrollmentsRaw ?? []) as TrainingEnrollment[];
    const enrollmentBySession = new Map(
      myEnrollments.map((item) => [item.session_id, item]),
    );

    const courseIds = [
      ...new Set((publishedCourses ?? []).map((c) => (c as TrainingCourse).id)),
    ];

    let sessions: TrainingSession[] = [];
    if (courseIds.length > 0) {
      const { data: sessionRows, error: sessionsError } = await supabase
        .from(TRAINING_SESSIONS_TABLE)
        .select("*")
        .in("course_id", courseIds)
        .eq("status", "scheduled")
        .order("starts_at", { ascending: true });

      if (sessionsError) {
        return { ok: false, error: formatTrainingDbError(sessionsError.message) };
      }

      sessions = (sessionRows ?? []) as TrainingSession[];
    }

    const sessionIds = sessions.map((s) => s.id);
    const enrollmentCounts = new Map<string, number>();

    if (sessionIds.length > 0) {
      const { data: countRows, error: countError } = await supabase
        .from(TRAINING_ENROLLMENTS_TABLE)
        .select("session_id")
        .in("session_id", sessionIds)
        .eq("status", "enrolled");

      if (countError) {
        return { ok: false, error: formatTrainingDbError(countError.message) };
      }

      for (const row of countRows ?? []) {
        const sid = (row as { session_id: string }).session_id;
        enrollmentCounts.set(sid, (enrollmentCounts.get(sid) ?? 0) + 1);
      }
    }

    const providerIds = [
      ...new Set((publishedCourses ?? []).map((c) => (c as TrainingCourse).provider_id)),
    ];

    const providerNames = new Map<string, string>();
    if (providerIds.length > 0) {
      const { data: providerRows } = await supabase
        .from(TRAINING_PROVIDERS_TABLE)
        .select("id, display_name")
        .in("id", providerIds);

      for (const row of providerRows ?? []) {
        const p = row as { id: string; display_name: string };
        providerNames.set(p.id, p.display_name || "Training provider");
      }
    }

    const catalog: TrainingCourseView[] = (publishedCourses ?? []).map((row) => {
      const course = row as TrainingCourse;
      const courseSessions = sessions
        .filter((s) => s.course_id === course.id)
        .map((s) =>
          buildSessionView(
            s,
            enrollmentCounts.get(s.id) ?? 0,
            enrollmentBySession.get(s.id),
          ),
        );

      return buildCourseView(
        course,
        providerNames.get(course.provider_id) ?? "Training provider",
        courseSessions,
      );
    });

    const enrollmentCourseIds = [...new Set(myEnrollments.map((e) => e.course_id))];
    const enrollmentSessionIds = [...new Set(myEnrollments.map((e) => e.session_id))];

    const enrollmentCourses = new Map<string, TrainingCourse>();
    const enrollmentSessions = new Map<string, TrainingSession>();

    if (enrollmentCourseIds.length > 0) {
      const { data: ec } = await supabase
        .from(TRAINING_COURSES_TABLE)
        .select("*")
        .in("id", enrollmentCourseIds);
      for (const row of ec ?? []) {
        const c = row as TrainingCourse;
        enrollmentCourses.set(c.id, c);
      }
    }

    if (enrollmentSessionIds.length > 0) {
      const { data: es } = await supabase
        .from(TRAINING_SESSIONS_TABLE)
        .select("*")
        .in("id", enrollmentSessionIds);
      for (const row of es ?? []) {
        const s = row as TrainingSession;
        enrollmentSessions.set(s.id, s);
      }
    }

    const myEnrollmentViews: TrainingEnrollmentView[] = myEnrollments
      .map((enrollment) => {
        const course = enrollmentCourses.get(enrollment.course_id);
        const session = enrollmentSessions.get(enrollment.session_id);
        if (course && session) {
          return buildEnrollmentView(enrollment, course, session);
        }

        return {
          id: enrollment.id,
          courseId: enrollment.course_id,
          courseTitle: course?.title ?? "Enrolled course",
          sessionId: enrollment.session_id,
          sessionTitle: session?.title ?? "Scheduled session",
          startsAt: session?.starts_at ?? enrollment.enrolled_at,
          zoomUrl: session?.zoom_url ?? "",
          status: enrollment.status,
          enrolledAt: enrollment.enrolled_at,
          traineeName: enrollment.trainee_name ?? "",
          traineeEmail: enrollment.trainee_email ?? "",
        };
      });

    let providerCourses: TrainingCourseView[] = [];
    let providerView: TrainingProviderView | null = null;
    let providerRoster: ProviderEnrollmentRosterEntry[] = [];

    const enrollmentPrefill = await getEnrollmentPrefill(
      supabase,
      user.id,
      user.email ?? "",
    );

    if (provider) {
      providerView = {
        id: provider.id,
        displayName: provider.display_name,
        bio: provider.bio,
      };

      const { data: ownCourses, error: ownError } = await supabase
        .from(TRAINING_COURSES_TABLE)
        .select("*")
        .eq("provider_user_id", user.id)
        .order("updated_at", { ascending: false });

      if (ownError) {
        return { ok: false, error: formatTrainingDbError(ownError.message) };
      }

      const ownCourseIds = (ownCourses ?? []).map((c) => (c as TrainingCourse).id);
      let ownSessions: TrainingSession[] = [];

      if (ownCourseIds.length > 0) {
        const { data: ownSessionRows } = await supabase
          .from(TRAINING_SESSIONS_TABLE)
          .select("*")
          .in("course_id", ownCourseIds)
          .order("starts_at", { ascending: true });

        ownSessions = (ownSessionRows ?? []) as TrainingSession[];

        const ownSessionIds = ownSessions.map((s) => s.id);
        const providerEnrollmentCounts = new Map<string, number>();

        if (ownSessionIds.length > 0) {
          const { data: providerEnrollments } = await supabase
            .from(TRAINING_ENROLLMENTS_TABLE)
            .select("*")
            .in("course_id", ownCourseIds)
            .eq("status", "enrolled")
            .order("enrolled_at", { ascending: false });

          const courseTitleById = new Map(
            (ownCourses ?? []).map((c) => [(c as TrainingCourse).id, (c as TrainingCourse).title]),
          );
          const sessionById = new Map(ownSessions.map((s) => [s.id, s]));

          for (const row of providerEnrollments ?? []) {
            const enrollment = row as TrainingEnrollment;
            providerEnrollmentCounts.set(
              enrollment.session_id,
              (providerEnrollmentCounts.get(enrollment.session_id) ?? 0) + 1,
            );

            const session = sessionById.get(enrollment.session_id);
            if (!session) continue;

            providerRoster.push({
              id: enrollment.id,
              courseId: enrollment.course_id,
              courseTitle: courseTitleById.get(enrollment.course_id) ?? "Course",
              sessionId: enrollment.session_id,
              sessionTitle: session.title,
              sessionStartsAt: session.starts_at,
              traineeName: enrollment.trainee_name ?? "",
              traineeEmail: enrollment.trainee_email ?? "",
              traineePhone: enrollment.trainee_phone ?? "",
              traineeBusiness: enrollment.trainee_business ?? "",
              enrolledAt: enrollment.enrolled_at,
              status: enrollment.status,
            });
          }
        }

        providerCourses = (ownCourses ?? []).map((row) => {
          const course = row as TrainingCourse;
          const courseSessions = ownSessions
            .filter((s) => s.course_id === course.id)
            .map((s) =>
              buildSessionView(
                s,
                providerEnrollmentCounts.get(s.id) ?? 0,
                undefined,
              ),
            );

          return buildCourseView(course, provider.display_name || "You", courseSessions);
        });
      } else {
        providerCourses = [];
      }
    }

    return {
      ok: true,
      catalog,
      myEnrollments: myEnrollmentViews,
      provider: providerView,
      providerCourses,
      providerRoster,
      enrollmentPrefill,
      isProvider: Boolean(provider),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load training data.";
    if (isMissingTrainingTableError(message)) {
      return { ok: true, warning: message, catalog: [], myEnrollments: [], isProvider: false };
    }
    return { ok: false, error: message };
  }
}

export async function registerAsProviderAction(input: {
  displayName: string;
  bio?: string;
}): Promise<TrainingActionResult & { provider?: TrainingProviderView }> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, provider: { id: "demo", displayName: input.displayName, bio: input.bio ?? "" } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { businessId, businessName, error: businessError } = await getUserBusinessId(
    supabase,
    user.id,
  );

  if (businessError) {
    return { ok: false, error: businessError };
  }

  if (!businessId) {
    return {
      ok: false,
      error: "Complete your business profile before registering as a training provider.",
    };
  }

  const displayName = input.displayName.trim() || businessName || "Training provider";

  const { data, error } = await supabase
    .from(TRAINING_PROVIDERS_TABLE)
    .upsert(
      {
        user_id: user.id,
        business_id: businessId,
        display_name: displayName,
        bio: input.bio?.trim() ?? "",
        status: "active",
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: formatTrainingDbError(error.message) };
  }

  const provider = data as TrainingProvider;
  revalidatePath("/dashboard/training");

  return {
    ok: true,
    provider: {
      id: provider.id,
      displayName: provider.display_name,
      bio: provider.bio,
    },
  };
}

export async function createCourseAction(input: {
  title: string;
  summary: string;
  description?: string;
}): Promise<TrainingActionResult & { courseId?: string }> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, courseId: "demo-new-course" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const provider = await fetchProviderForUser(supabase, user.id);
  if (!provider) {
    return { ok: false, error: "Register as a provider first." };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Course title is required." };
  }

  const { data, error } = await supabase
    .from(TRAINING_COURSES_TABLE)
    .insert({
      provider_id: provider.id,
      provider_user_id: user.id,
      title,
      summary: input.summary.trim(),
      description: input.description?.trim() ?? "",
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: formatTrainingDbError(error.message) };
  }

  revalidatePath("/dashboard/training");
  return { ok: true, courseId: (data as { id: string }).id };
}

export async function updateCourseAction(input: {
  courseId: string;
  title?: string;
  summary?: string;
  description?: string;
  status?: TrainingCourse["status"];
}): Promise<TrainingActionResult> {
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

  const updates: Record<string, string> = { updated_at: new Date().toISOString() };
  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.summary !== undefined) updates.summary = input.summary.trim();
  if (input.description !== undefined) updates.description = input.description.trim();
  if (input.status !== undefined) updates.status = input.status;

  const { error } = await supabase
    .from(TRAINING_COURSES_TABLE)
    .update(updates)
    .eq("id", input.courseId)
    .eq("provider_user_id", user.id);

  if (error) {
    return { ok: false, error: formatTrainingDbError(error.message) };
  }

  revalidatePath("/dashboard/training");
  return { ok: true };
}

export async function createSessionAction(input: {
  courseId: string;
  title: string;
  startsAt: string;
  endsAt?: string;
  zoomUrl: string;
  maxSeats?: number;
}): Promise<TrainingActionResult & { sessionId?: string }> {
  if (!isSupabaseAuthEnabled()) {
    return { ok: true, sessionId: "demo-new-session" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const title = input.title.trim();
  const zoomUrl = input.zoomUrl.trim();

  if (!title) {
    return { ok: false, error: "Session title is required." };
  }

  if (!input.startsAt) {
    return { ok: false, error: "Start date and time are required." };
  }

  const { data: course, error: courseError } = await supabase
    .from(TRAINING_COURSES_TABLE)
    .select("id")
    .eq("id", input.courseId)
    .eq("provider_user_id", user.id)
    .maybeSingle();

  if (courseError || !course) {
    return { ok: false, error: "Course not found or you are not the provider." };
  }

  const { data, error } = await supabase
    .from(TRAINING_SESSIONS_TABLE)
    .insert({
      course_id: input.courseId,
      title,
      starts_at: input.startsAt,
      ends_at: input.endsAt || null,
      zoom_url: zoomUrl,
      max_seats: input.maxSeats ?? null,
      status: "scheduled",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: formatTrainingDbError(error.message) };
  }

  revalidatePath("/dashboard/training");
  return { ok: true, sessionId: (data as { id: string }).id };
}

export async function enrollInSessionAction(
  sessionId: string,
  details: {
    traineeName: string;
    traineeEmail: string;
    traineePhone?: string;
    traineeBusiness?: string;
  },
): Promise<TrainingActionResult> {
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

  const { data: session, error: sessionError } = await supabase
    .from(TRAINING_SESSIONS_TABLE)
    .select("id, course_id, max_seats, status, starts_at")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError || !session) {
    return { ok: false, error: "Session not found." };
  }

  const row = session as TrainingSession;
  if (row.status !== "scheduled") {
    return { ok: false, error: "This session is not open for enrollment." };
  }

  if (row.max_seats) {
    const { count, error: countError } = await supabase
      .from(TRAINING_ENROLLMENTS_TABLE)
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("status", "enrolled");

    if (countError) {
      return { ok: false, error: formatTrainingDbError(countError.message) };
    }

    if ((count ?? 0) >= row.max_seats) {
      return { ok: false, error: "This session is full." };
    }
  }

  const { businessId } = await getUserBusinessId(supabase, user.id);

  const traineeName = details.traineeName.trim();
  const traineeEmail = details.traineeEmail.trim();

  if (!traineeName) {
    return { ok: false, error: "Your name is required to enroll." };
  }

  if (!traineeEmail) {
    return { ok: false, error: "Your email is required so the provider can contact you." };
  }

  const { data: existingEnrollment, error: existingError } = await supabase
    .from(TRAINING_ENROLLMENTS_TABLE)
    .select("id, status")
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    return { ok: false, error: formatTrainingDbError(existingError.message) };
  }

  const enrollmentPayload = {
    course_id: row.course_id,
    session_id: sessionId,
    business_id: businessId,
    trainee_name: traineeName,
    trainee_email: traineeEmail,
    trainee_phone: details.traineePhone?.trim() ?? "",
    trainee_business: details.traineeBusiness?.trim() ?? "",
    status: "enrolled" as const,
  };

  if (existingEnrollment?.status === "enrolled") {
    const { error } = await supabase
      .from(TRAINING_ENROLLMENTS_TABLE)
      .update({
        ...enrollmentPayload,
        enrolled_at: new Date().toISOString(),
      })
      .eq("id", existingEnrollment.id)
      .eq("user_id", user.id);

    if (error) {
      return { ok: false, error: formatTrainingDbError(error.message) };
    }

    revalidatePath("/dashboard/training");
    return { ok: true };
  }

  if (existingEnrollment) {
    const { error: deleteError } = await supabase
      .from(TRAINING_ENROLLMENTS_TABLE)
      .delete()
      .eq("id", existingEnrollment.id)
      .eq("user_id", user.id);

    if (deleteError) {
      return { ok: false, error: formatTrainingDbError(deleteError.message) };
    }
  }

  const { error } = await supabase.from(TRAINING_ENROLLMENTS_TABLE).insert({
    ...enrollmentPayload,
    user_id: user.id,
  });

  if (error) {
    if (error.message.includes("unique")) {
      return { ok: false, error: "You are already enrolled in this session." };
    }
    return { ok: false, error: formatTrainingDbError(error.message) };
  }

  revalidatePath("/dashboard/training");
  return { ok: true };
}

export async function cancelEnrollmentAction(enrollmentId: string): Promise<TrainingActionResult> {
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

  const { error } = await supabase
    .from(TRAINING_ENROLLMENTS_TABLE)
    .delete()
    .eq("id", enrollmentId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: formatTrainingDbError(error.message) };
  }

  revalidatePath("/dashboard/training");
  return { ok: true };
}

export async function cancelEnrollmentBySessionAction(
  sessionId: string,
): Promise<TrainingActionResult> {
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

  const { error } = await supabase
    .from(TRAINING_ENROLLMENTS_TABLE)
    .delete()
    .eq("session_id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: formatTrainingDbError(error.message) };
  }

  revalidatePath("/dashboard/training");
  return { ok: true };
}
