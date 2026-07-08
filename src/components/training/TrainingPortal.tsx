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
  type TrainingCourseView,
  type TrainingEnrollmentView,
  type TrainingPortalTab,
  type TrainingSessionView,
} from "@/lib/training-data";

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
  onCancel,
  showZoom,
  enrolling,
}: {
  session: TrainingSessionView;
  courseTitle: string;
  onEnroll?: (sessionId: string) => void;
  onCancel?: (enrollmentId: string) => void;
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
              onClick={() => onEnroll(session.id)}
              className="rounded-md bg-accent px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enrolling ? "Enrolling…" : full ? "Full" : "Enroll"}
            </button>
          ) : null}

          {onCancel && session.isEnrolled && session.enrollmentId ? (
            <button
              type="button"
              disabled={enrolling}
              onClick={() => onCancel(session.enrollmentId!)}
              className="rounded-md border border-border px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted transition hover:bg-background"
            >
              Cancel
            </button>
          ) : null}

          {session.isEnrolled ? (
            <span className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
              Enrolled
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CourseCatalogCard({
  course,
  onEnroll,
  enrollingSessionId,
  onCancel,
}: {
  course: TrainingCourseView;
  onEnroll: (sessionId: string) => void;
  enrollingSessionId: string | null;
  onCancel: (enrollmentId: string) => void;
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
                onCancel={onCancel}
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
  const [isProvider, setIsProvider] = useState(false);
  const [providerName, setProviderName] = useState("");

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
  const [sessionStartsAt, setSessionStartsAt] = useState("");
  const [sessionZoomUrl, setSessionZoomUrl] = useState("");
  const [sessionMaxSeats, setSessionMaxSeats] = useState("");

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
    setIsProvider(result.isProvider ?? false);
    setProviderName(result.provider?.displayName ?? "");
    setUsingDemo(false);
    setLoading(false);
  }, [authEnabled]);

  useEffect(() => {
    if (!hydrated || initialized.current) return;
    initialized.current = true;
    void loadData();
  }, [hydrated, loadData]);

  async function handleEnroll(sessionId: string) {
    setEnrollingSessionId(sessionId);
    setError(null);
    const result = await enrollInSessionAction(sessionId);
    setEnrollingSessionId(null);

    if (!result.ok) {
      setError(result.error ?? "Could not enroll.");
      return;
    }

    await loadData();
    setTab("my-learning");
  }

  async function handleCancel(enrollmentId: string) {
    setSaving(true);
    setError(null);
    const result = await cancelEnrollmentAction(enrollmentId);
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "Could not cancel enrollment.");
      return;
    }

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
    if (!selectedCourseId) {
      setError("Select a course first.");
      return;
    }

    setSaving(true);
    setError(null);

    const result = await createSessionAction({
      courseId: selectedCourseId,
      title: sessionTitle,
      startsAt: new Date(sessionStartsAt).toISOString(),
      zoomUrl: sessionZoomUrl,
      maxSeats: sessionMaxSeats ? Number(sessionMaxSeats) : undefined,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "Could not create session.");
      return;
    }

    setSessionTitle("");
    setSessionStartsAt("");
    setSessionZoomUrl("");
    setSessionMaxSeats("");
    await loadData();
  }

  const upcomingCount = myEnrollments.filter(
    (e) => e.status === "enrolled" && isSessionUpcoming(e.startsAt),
  ).length;

  return (
    <DashboardPageLayout
      title="Training"
      description="Live courses and workshops for African SMEs — enroll as a trainee or publish sessions as a provider."
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
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <TabButton active={tab === "catalog"} onClick={() => setTab("catalog")}>
          Course catalog
        </TabButton>
        <TabButton active={tab === "my-learning"} onClick={() => setTab("my-learning")}>
          My learning
        </TabButton>
        <TabButton active={tab === "provider"} onClick={() => setTab("provider")}>
          Provider
        </TabButton>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : null}

      {!loading && tab === "catalog" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {catalog.length === 0 ? (
            <p className="text-sm text-muted">No published courses yet. Check back soon.</p>
          ) : (
            catalog.map((course) => (
              <CourseCatalogCard
                key={course.id}
                course={course}
                onEnroll={handleEnroll}
                enrollingSessionId={enrollingSessionId}
                onCancel={handleCancel}
              />
            ))
          )}
        </div>
      ) : null}

      {!loading && tab === "my-learning" ? (
        <div className="space-y-4">
          {myEnrollments.length === 0 ? (
            <p className="text-sm text-muted">
              You have not enrolled in any sessions yet. Browse the catalog to get started.
            </p>
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
                      onClick={() => handleCancel(enrollment.id)}
                      className="rounded-md border border-border px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted"
                    >
                      Cancel enrollment
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
                  <h2 className="text-lg font-bold text-foreground lg:col-span-2">Add session</h2>
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
                    <span className="font-medium text-foreground">Starts at</span>
                    <input
                      required
                      type="datetime-local"
                      value={sessionStartsAt}
                      onChange={(e) => setSessionStartsAt(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm lg:col-span-2">
                    <span className="font-medium text-foreground">Zoom link</span>
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
                    className="inline-flex items-center gap-2 self-end rounded-md bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-white"
                  >
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
            </>
          )}
        </div>
      ) : null}
    </DashboardPageLayout>
  );
}
