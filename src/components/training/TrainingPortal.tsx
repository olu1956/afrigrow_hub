"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  GraduationCap,
  Loader2,
  Plus,
  Users,
  Video,
} from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { DashboardStatGrid } from "@/components/dashboard/DashboardPageCanvas";
import { useSession } from "@/components/providers/SessionProvider";
import {
  cancelEnrollmentAction,
  cancelEnrollmentBySessionAction,
  createCourseAction,
  createSessionAction,
  enrollInSessionAction,
  getTrainingPortalDataAction,
  registerAsProviderAction,
  updateCourseAction,
} from "@/lib/auth/training-actions";
import {
  demoMyEnrollments,
  demoTrainingCourses,
  formatTrainingDate,
  isSessionUpcoming,
  type ProviderEnrollmentRosterEntry,
  type TrainingCourseView,
  type TrainingEnrollmentPrefill,
  type TrainingEnrollmentView,
  type TrainingPortalTab,
  type TrainingSessionView,
} from "@/lib/training-data";

function EnrollModal({
  open,
  courseTitle,
  sessionTitle,
  prefill,
  saving,
  onClose,
  onSubmit,
}: {
  open: boolean;
  courseTitle: string;
  sessionTitle: string;
  prefill: TrainingEnrollmentPrefill;
  saving: boolean;
  onClose: () => void;
  onSubmit: (details: TrainingEnrollmentPrefill) => void;
}) {
  const [traineeName, setTraineeName] = useState(prefill.traineeName);
  const [traineeEmail, setTraineeEmail] = useState(prefill.traineeEmail);
  const [traineePhone, setTraineePhone] = useState(prefill.traineePhone);
  const [traineeBusiness, setTraineeBusiness] = useState(prefill.traineeBusiness);

  useEffect(() => {
    if (!open) return;
    setTraineeName(prefill.traineeName);
    setTraineeEmail(prefill.traineeEmail);
    setTraineePhone(prefill.traineePhone);
    setTraineeBusiness(prefill.traineeBusiness);
  }, [open, prefill]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h2 className="text-lg font-bold text-foreground">Confirm enrollment</h2>
        <p className="mt-2 text-sm text-muted">
          {courseTitle} · {sessionTitle}
        </p>
        <p className="mt-1 text-sm text-muted">
          Your details are shared with the course provider so they know who is attending.
        </p>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ traineeName, traineeEmail, traineePhone, traineeBusiness });
          }}
        >
          <label className="block text-sm">
            <span className="font-medium text-foreground">Full name</span>
            <input
              required
              type="text"
              value={traineeName}
              onChange={(e) => setTraineeName(e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Email</span>
            <input
              required
              type="email"
              value={traineeEmail}
              onChange={(e) => setTraineeEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Phone / WhatsApp</span>
            <input
              type="text"
              value={traineePhone}
              onChange={(e) => setTraineePhone(e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Business name</span>
            <input
              type="text"
              value={traineeBusiness}
              onChange={(e) => setTraineeBusiness(e.target.value)}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
            />
          </label>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm enrollment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-primary text-white shadow-sm"
          : "bg-card text-muted hover:bg-primary-light/60 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function SessionCard({
  session,
  courseTitle,
  onEnroll,
  onWithdraw,
  onReset,
  showZoom,
  enrolling,
}: {
  session: TrainingSessionView;
  courseTitle: string;
  onEnroll?: (sessionId: string, courseTitle: string, sessionTitle: string) => void;
  onWithdraw?: (sessionId: string) => void;
  onReset?: (sessionId: string) => void;
  showZoom?: boolean;
  enrolling?: boolean;
}) {
  const full = session.maxSeats !== null && session.enrollmentCount >= session.maxSeats;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{courseTitle}</p>
          <h3 className="mt-1 font-semibold text-foreground">{session.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Calendar className="h-3.5 w-3.5" />
            {formatTrainingDate(session.startsAt)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <Users className="h-3.5 w-3.5" />
            {session.enrollmentCount}
            {session.maxSeats ? ` / ${session.maxSeats}` : ""} enrolled
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {showZoom && session.zoomUrl && isSessionUpcoming(session.startsAt) ? (
            <a
              href={session.zoomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-primary/90"
            >
              <Video className="h-3.5 w-3.5" />
              Join Zoom
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}

          {onEnroll && !session.isEnrolled && isSessionUpcoming(session.startsAt) ? (
            <button
              type="button"
              disabled={full || enrolling}
              onClick={() => onEnroll(session.id, courseTitle, session.title)}
              className="rounded-md bg-accent px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enrolling ? "Enrolling…" : full ? "Full" : "Enroll"}
            </button>
          ) : null}

          {onWithdraw && session.isEnrolled ? (
            <button
              type="button"
              disabled={enrolling}
              onClick={() => onWithdraw(session.id)}
              className="rounded-md border border-border px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted transition hover:bg-background"
            >
              Withdraw
            </button>
          ) : null}

          {session.isEnrolled ? (
            <span className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
              Enrolled
            </span>
          ) : null}
        </div>

        {!session.isEnrolled && onReset ? (
          <button
            type="button"
            disabled={enrolling}
            onClick={() => onReset(session.id)}
            className="mt-3 text-xs font-semibold text-primary hover:underline"
          >
            Clear previous enrollment attempt
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CourseCatalogCard({
  course,
  onEnroll,
  enrollingSessionId,
  onWithdraw,
  onReset,
}: {
  course: TrainingCourseView;
  onEnroll: (sessionId: string, courseTitle: string, sessionTitle: string) => void;
  enrollingSessionId: string | null;
  onWithdraw: (sessionId: string) => void;
  onReset: (sessionId: string) => void;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-primary-dark px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
          {course.providerName}
        </p>
        <h2 className="mt-1 text-lg font-bold text-white">{course.title}</h2>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-sm leading-relaxed text-muted">{course.summary}</p>
        {course.sessions.length === 0 ? (
          <p className="text-sm text-muted">No upcoming sessions scheduled.</p>
        ) : (
          <div className="space-y-3">
            {course.sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                courseTitle={course.title}
                onEnroll={onEnroll}
                onWithdraw={onWithdraw}
                onReset={onReset}
                enrolling={enrollingSessionId === session.id}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function TrainingPortal() {
  const { hydrated, authEnabled } = useSession();
  const initialized = useRef(false);

  const [tab, setTab] = useState<TrainingPortalTab>("catalog");
  const [catalog, setCatalog] = useState<TrainingCourseView[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<TrainingEnrollmentView[]>([]);
  const [providerCourses, setProviderCourses] = useState<TrainingCourseView[]>([]);
  const [providerRoster, setProviderRoster] = useState<ProviderEnrollmentRosterEntry[]>([]);
  const [enrollmentPrefill, setEnrollmentPrefill] = useState<TrainingEnrollmentPrefill>({
    traineeName: "",
    traineeEmail: "",
    traineePhone: "",
    traineeBusiness: "",
  });
  const [isProvider, setIsProvider] = useState(false);
  const [providerName, setProviderName] = useState("");
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [pendingSession, setPendingSession] = useState<{
    sessionId: string;
    courseTitle: string;
    sessionTitle: string;
  } | null>(null);
  const [stuckSessionId, setStuckSessionId] = useState<string | null>(null);

  const [loading, setLoading] = useState(authEnabled);
  const [saving, setSaving] = useState(false);
  const [enrollingSessionId, setEnrollingSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [setupWarning, setSetupWarning] = useState<string | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);

  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseSummary, setNewCourseSummary] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [sessionZoomUrl, setSessionZoomUrl] = useState("");
  const [sessionMaxSeats, setSessionMaxSeats] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!authEnabled) {
      setCatalog(demoTrainingCourses);
      setMyEnrollments(demoMyEnrollments);
      setProviderCourses([]);
      setIsProvider(false);
      setUsingDemo(true);
      setLoading(false);
      return;
    }

    const result = await getTrainingPortalDataAction();
    if (result.warning) {
      setSetupWarning(result.warning);
    }

    if (!result.ok) {
      setError(result.error ?? "Could not load training portal.");
      setLoading(false);
      return;
    }

      setCatalog(result.catalog ?? []);
      setMyEnrollments(result.myEnrollments ?? []);
      setProviderCourses(result.providerCourses ?? []);
      setProviderRoster(result.providerRoster ?? []);
      setEnrollmentPrefill(
        result.enrollmentPrefill ?? {
          traineeName: "",
          traineeEmail: "",
          traineePhone: "",
          traineeBusiness: "",
        },
      );
    setIsProvider(result.isProvider ?? false);
    setProviderName(result.provider?.displayName ?? "");
    setUsingDemo(false);
    if (!selectedCourseId && (result.providerCourses?.length ?? 0) > 0) {
      setSelectedCourseId(result.providerCourses![0]!.id);
    }
    setLoading(false);
  }, [authEnabled, selectedCourseId]);

  useEffect(() => {
    if (!hydrated || initialized.current) return;
    initialized.current = true;
    void loadData();
  }, [hydrated, loadData]);

  function handleTabChange(next: TrainingPortalTab) {
    setTab(next);
    setError(null);
    setStuckSessionId(null);
  }

  async function handleClearStuckEnrollment() {
    if (!stuckSessionId) return;
    setSaving(true);
    const result = await cancelEnrollmentBySessionAction(stuckSessionId);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? "Could not remove enrollment.");
      return;
    }
    setError(null);
    setStuckSessionId(null);
    await loadData();
  }

  function openEnrollModal(sessionId: string, courseTitle: string, sessionTitle: string) {
    setPendingSession({ sessionId, courseTitle, sessionTitle });
    setEnrollModalOpen(true);
    setError(null);
  }

  async function handleConfirmEnrollment(details: TrainingEnrollmentPrefill) {
    if (!pendingSession) return;

    setEnrollingSessionId(pendingSession.sessionId);
    setError(null);

    const result = await enrollInSessionAction(pendingSession.sessionId, details);
    setEnrollingSessionId(null);

    if (!result.ok) {
      setError(result.error ?? "Could not enroll.");
      if (result.error?.includes("already enrolled")) {
        setStuckSessionId(pendingSession.sessionId);
      }
      return;
    }

    setEnrollModalOpen(false);
    setPendingSession(null);
    setSuccessMessage("Enrollment confirmed. Your session is now under My courses.");
    await loadData();
    setTab("my-learning");
  }

  function handleEnroll(sessionId: string, courseTitle: string, sessionTitle: string) {
    openEnrollModal(sessionId, courseTitle, sessionTitle);
  }

  async function handleWithdrawSession(sessionId: string) {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const result = await cancelEnrollmentBySessionAction(sessionId);
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "Could not withdraw from this session.");
      return;
    }

    setSuccessMessage("Enrollment removed. You can enroll again when ready.");
    setStuckSessionId(null);
    await loadData();
  }

  async function handleResetSession(sessionId: string) {
    await handleWithdrawSession(sessionId);
  }

  async function handleCancel(enrollmentId: string, sessionId?: string) {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const result = sessionId
      ? await cancelEnrollmentBySessionAction(sessionId)
      : await cancelEnrollmentAction(enrollmentId);

    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "Could not cancel enrollment.");
      return;
    }

    setSuccessMessage("Enrollment removed.");
    await loadData();
  }

  async function handleRegisterProvider(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const result = await registerAsProviderAction({
      displayName: providerName || "My training",
      bio: "",
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "Could not register as provider.");
      return;
    }

    await loadData();
  }

  async function handleCreateCourse(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const result = await createCourseAction({
      title: newCourseTitle,
      summary: newCourseSummary,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "Could not create course.");
      return;
    }

    setNewCourseTitle("");
    setNewCourseSummary("");
    if (result.courseId) {
      setSelectedCourseId(result.courseId);
    }
    await loadData();
  }

  async function handlePublish(courseId: string) {
    setSaving(true);
    setError(null);
    const result = await updateCourseAction({ courseId, status: "published" });
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "Could not publish course.");
      return;
    }

    await loadData();
  }

  async function handleCreateSession(e: FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);

    if (!selectedCourseId) {
      setError("Select a course first.");
      return;
    }

    if (!sessionDate || !sessionTime) {
      setError("Please set both a date and a time for the session.");
      return;
    }

    const startsAt = new Date(`${sessionDate}T${sessionTime}`);
    if (Number.isNaN(startsAt.getTime())) {
      setError("That date and time are not valid. Check both fields and try again.");
      return;
    }

    setSaving(true);
    setError(null);

    const result = await createSessionAction({
      courseId: selectedCourseId,
      title: sessionTitle,
      startsAt: startsAt.toISOString(),
      zoomUrl: sessionZoomUrl,
      maxSeats: sessionMaxSeats ? Number(sessionMaxSeats) : undefined,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "Could not create session.");
      return;
    }

    setSessionTitle("");
    setSessionDate("");
    setSessionTime("");
    setSessionZoomUrl("");
    setSessionMaxSeats("");
    setSuccessMessage("Session added. You can now publish the course to the catalog.");
    await loadData();
  }

  const upcomingCount = myEnrollments.filter(
    (e) => e.status === "enrolled" && isSessionUpcoming(e.startsAt),
  ).length;

  return (
    <DashboardPageLayout
      title="Training"
      description="Browse live courses and enroll as a learner — or switch to Provider to publish your own sessions."
      heroFooter={
        <DashboardStatGrid
          stats={[
            {
              label: "Available courses",
              value: String(catalog.length),
              icon: BookOpen,
            },
            {
              label: "My upcoming sessions",
              value: String(upcomingCount),
              icon: Calendar,
            },
            {
              label: "Provider courses",
              value: String(providerCourses.length),
              icon: GraduationCap,
            },
          ]}
        />
      }
    >
      {usingDemo ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Preview mode — showing demo courses. Sign in with Supabase to use the live training portal.
        </p>
      ) : null}

      {setupWarning ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {setupWarning}
        </p>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{error}</p>
          {stuckSessionId ? (
            <button
              type="button"
              disabled={saving}
              onClick={handleClearStuckEnrollment}
              className="mt-3 rounded-md border border-red-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-red-800"
            >
              Remove enrollment & try again
            </button>
          ) : null}
        </div>
      ) : null}

      {successMessage ? (
        <p className="rounded-xl border border-primary/20 bg-primary-light/50 px-4 py-3 text-sm text-primary-dark">
          {successMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === "catalog"} onClick={() => handleTabChange("catalog")}>
            Browse & enroll
          </TabButton>
          <TabButton active={tab === "my-learning"} onClick={() => handleTabChange("my-learning")}>
            My courses
          </TabButton>
          {isProvider ? (
            <TabButton active={tab === "provider"} onClick={() => handleTabChange("provider")}>
              Provider
            </TabButton>
          ) : (
            <button
              type="button"
              onClick={() => handleTabChange("provider")}
              className="rounded-md border border-dashed border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary-light/40"
            >
              Teach a course
            </button>
          )}
        </div>

        {tab !== "catalog" ? (
          <button
            type="button"
            onClick={() => handleTabChange("catalog")}
            className="inline-flex w-fit rounded-md bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-accent/90"
          >
            Browse courses & enroll
          </button>
        ) : null}
      </div>

      {tab === "provider" && isProvider ? (
        <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted">
          You are in <span className="font-semibold text-foreground">provider mode</span> — create
          and publish courses here. To join a course as a learner, open{" "}
          <button
            type="button"
            onClick={() => handleTabChange("catalog")}
            className="font-semibold text-primary hover:underline"
          >
            Browse & enroll
          </button>
          .
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : null}

      {!loading && tab === "catalog" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-primary/15 bg-primary-light/30 p-5">
            <h2 className="text-lg font-bold text-foreground">Find a course and enroll</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Pick a published session below and click <span className="font-semibold">Enroll</span>.
              You will confirm your name and contact details so the provider knows who is attending.
              After enrolling, your sessions appear under <span className="font-semibold">My courses</span>.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {catalog.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-6">
                <p className="font-semibold text-foreground">No courses open for enrollment yet</p>
                <p className="mt-2 text-sm text-muted">
                  When providers publish courses, they will appear here with an Enroll button on each
                  session.
                </p>
              </div>
            ) : (
              catalog.map((course) => (
                <CourseCatalogCard
                  key={course.id}
                  course={course}
                onEnroll={(sessionId, courseTitle, sessionTitle) =>
                  handleEnroll(sessionId, courseTitle, sessionTitle)
                }
                enrollingSessionId={enrollingSessionId}
                onWithdraw={handleWithdrawSession}
                onReset={handleResetSession}
              />
              ))
            )}
          </div>
        </div>
      ) : null}

      {!loading && tab === "my-learning" ? (
        <div className="space-y-4">
          {myEnrollments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <h2 className="text-lg font-bold text-foreground">No courses yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                You have not enrolled in any sessions. Browse published courses and click Enroll on
                a session to get started.
              </p>
              <button
                type="button"
                onClick={() => handleTabChange("catalog")}
                className="mt-6 inline-flex rounded-md bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-accent/90"
              >
                Browse courses & enroll
              </button>
            </div>
          ) : (
            myEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {enrollment.courseTitle}
                </p>
                <h3 className="mt-1 font-semibold text-foreground">{enrollment.sessionTitle}</h3>
                <p className="mt-1 text-sm text-muted">{formatTrainingDate(enrollment.startsAt)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {enrollment.zoomUrl && isSessionUpcoming(enrollment.startsAt) ? (
                    <a
                      href={enrollment.zoomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wide text-white"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Join Zoom
                    </a>
                  ) : null}
                  {enrollment.status === "enrolled" ? (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleCancel(enrollment.id, enrollment.sessionId)}
                      className="rounded-md border border-border px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted"
                    >
                      Withdraw
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {!loading && tab === "provider" ? (
        <div className="space-y-8">
          {!isProvider ? (
            <form
              onSubmit={handleRegisterProvider}
              className="max-w-lg space-y-4 rounded-2xl border border-border bg-card p-6"
            >
              <h2 className="text-lg font-bold text-foreground">Become a training provider</h2>
              <p className="text-sm text-muted">
                Publish courses and live Zoom sessions for AfriGrow members. You need a completed
                business profile first.
              </p>
              <label className="block text-sm">
                <span className="font-medium text-foreground">Display name</span>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="Your organisation or trainer name"
                  className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-white"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Register as provider
              </button>
            </form>
          ) : (
            <>
              <div className="rounded-2xl border border-primary/20 bg-primary-light/40 p-5">
                <p className="text-sm font-semibold text-primary">Provider account active</p>
                <p className="mt-1 text-lg font-bold text-foreground">{providerName}</p>
                <p className="mt-2 text-sm text-muted">
                  Create a course, add sessions with Zoom links, then publish to the catalog.
                </p>
              </div>

              <form
                onSubmit={handleCreateCourse}
                className="grid gap-4 rounded-2xl border border-border bg-card p-6 lg:grid-cols-2"
              >
                <h2 className="text-lg font-bold text-foreground lg:col-span-2">New course</h2>
                <label className="block text-sm lg:col-span-1">
                  <span className="font-medium text-foreground">Title</span>
                  <input
                    required
                    type="text"
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm lg:col-span-1">
                  <span className="font-medium text-foreground">Summary</span>
                  <input
                    required
                    type="text"
                    value={newCourseSummary}
                    onChange={(e) => setNewCourseSummary(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-white lg:col-span-2 lg:w-fit"
                >
                  <Plus className="h-4 w-4" />
                  Create course (draft)
                </button>
              </form>

              {providerCourses.length > 0 ? (
                <form
                  onSubmit={handleCreateSession}
                  className="grid gap-4 rounded-2xl border border-border bg-card p-6 lg:grid-cols-2"
                >
                  <div className="lg:col-span-2">
                    <h2 className="text-lg font-bold text-foreground">Add session</h2>
                    <p className="mt-1 text-sm text-muted">
                      Step 2 of 3 — set date and time, then click Add session. Publish unlocks after
                      at least one session is saved.
                    </p>
                  </div>
                  <label className="block text-sm lg:col-span-2">
                    <span className="font-medium text-foreground">Course</span>
                    <select
                      required
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <option value="">Select a course</option>
                      {providerCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title} ({course.status})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">Session title</span>
                    <input
                      required
                      type="text"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">Session date</span>
                    <input
                      required
                      type="date"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">Session time</span>
                    <input
                      required
                      type="time"
                      value={sessionTime}
                      onChange={(e) => setSessionTime(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm lg:col-span-2">
                    <span className="font-medium text-foreground">Zoom link (optional for now)</span>
                    <input
                      type="url"
                      value={sessionZoomUrl}
                      onChange={(e) => setSessionZoomUrl(e.target.value)}
                      placeholder="https://zoom.us/j/..."
                      className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">Max seats (optional)</span>
                    <input
                      type="number"
                      min={1}
                      value={sessionMaxSeats}
                      onChange={(e) => setSessionMaxSeats(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 self-end rounded-md bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-white lg:col-span-2 lg:w-fit"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Add session
                  </button>
                </form>
              ) : null}

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Your courses</h2>
                {providerCourses.length === 0 ? (
                  <p className="text-sm text-muted">No courses yet. Create your first course above.</p>
                ) : (
                  providerCourses.map((course) => (
                    <div key={course.id} className="rounded-2xl border border-border bg-card p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-foreground">{course.title}</h3>
                          <p className="mt-1 text-sm text-muted">{course.summary}</p>
                          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">
                            Status: {course.status}
                          </p>
                        </div>
                        {course.status === "draft" ? (
                          <button
                            type="button"
                            disabled={saving || course.sessions.length === 0}
                            onClick={() => handlePublish(course.id)}
                            className="rounded-md bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
                          >
                            Publish to catalog
                          </button>
                        ) : null}
                      </div>
                      {course.sessions.length > 0 ? (
                        <div className="mt-4 space-y-2">
                          {course.sessions.map((session) => (
                            <div
                              key={session.id}
                              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            >
                              <span className="font-medium text-foreground">{session.title}</span>
                              <span className="text-muted"> · {formatTrainingDate(session.startsAt)}</span>
                              {session.zoomUrl ? (
                                <span className="text-muted"> · Zoom link set</span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-muted">
                          Add at least one session before publishing.
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground">Enrolled trainees</h2>
                <p className="text-sm text-muted">
                  Names and contact details submitted when members enroll in your sessions.
                </p>
                {providerRoster.length === 0 ? (
                  <p className="text-sm text-muted">No enrollments yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-border bg-primary-dark text-white">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Trainee</th>
                          <th className="px-4 py-3 font-semibold">Contact</th>
                          <th className="px-4 py-3 font-semibold">Session</th>
                          <th className="px-4 py-3 font-semibold">Enrolled</th>
                        </tr>
                      </thead>
                      <tbody>
                        {providerRoster.map((entry) => (
                          <tr key={entry.id} className="border-b border-border last:border-0">
                            <td className="px-4 py-3">
                              <p className="font-medium text-foreground">
                                {entry.traineeName || "—"}
                              </p>
                              <p className="text-xs text-muted">
                                {entry.traineeBusiness || "No business listed"}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-muted">
                              <p>{entry.traineeEmail || "—"}</p>
                              <p className="text-xs">{entry.traineePhone || "—"}</p>
                            </td>
                            <td className="px-4 py-3 text-muted">
                              <p className="font-medium text-foreground">{entry.sessionTitle}</p>
                              <p className="text-xs">{formatTrainingDate(entry.sessionStartsAt)}</p>
                            </td>
                            <td className="px-4 py-3 text-muted">
                              {formatTrainingDate(entry.enrolledAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : null}

      <EnrollModal
        open={enrollModalOpen}
        courseTitle={pendingSession?.courseTitle ?? ""}
        sessionTitle={pendingSession?.sessionTitle ?? ""}
        prefill={enrollmentPrefill}
        saving={enrollingSessionId !== null}
        onClose={() => {
          setEnrollModalOpen(false);
          setPendingSession(null);
        }}
        onSubmit={handleConfirmEnrollment}
      />
    </DashboardPageLayout>
  );
}
