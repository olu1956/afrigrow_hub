import type { TrainingCourseStatus } from "@/lib/database/training-courses";
import type { TrainingEnrollmentStatus } from "@/lib/database/training-enrollments";
import type { TrainingSessionStatus } from "@/lib/database/training-sessions";

export const ACTIVE_TRAINING_ENROLLMENT_STATUSES: TrainingEnrollmentStatus[] = [
  "enrolled",
  "completed",
];

export function isActiveEnrollmentStatus(
  status: TrainingEnrollmentStatus | null | undefined,
): boolean {
  return status === "enrolled" || status === "completed";
}

export function formatProgrammeProgress(
  lessonsCompleted: number,
  lessonCount: number,
  attended: boolean,
): string {
  const lessons =
    lessonCount === 0
      ? "No modules yet"
      : `${lessonsCompleted}/${lessonCount} ${lessonCount === 1 ? "module" : "modules"}`;
  return `${lessons} · ${attended ? "attendance recorded" : "attendance pending"}`;
}

export type TrainingLessonView = {
  id: string;
  courseId: string;
  title: string;
  notes: string;
  videoUrl: string;
  sortOrder: number;
  completed: boolean;
};

export type TrainingSessionView = {
  id: string;
  courseId: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  zoomUrl: string;
  maxSeats: number | null;
  status: TrainingSessionStatus;
  enrollmentCount: number;
  isEnrolled: boolean;
  enrollmentId: string | null;
  enrollmentStatus: TrainingEnrollmentStatus | null;
  hasPreviousAttempt: boolean;
};

export type TrainingCourseView = {
  id: string;
  title: string;
  summary: string;
  description: string;
  flyerImageUrl: string;
  status: TrainingCourseStatus;
  providerName: string;
  sessions: TrainingSessionView[];
  lessons: TrainingLessonView[];
};

export type TrainingEnrollmentView = {
  id: string;
  courseId: string;
  courseTitle: string;
  sessionId: string;
  sessionTitle: string;
  startsAt: string;
  zoomUrl: string;
  status: TrainingEnrollmentStatus;
  enrolledAt: string;
  traineeName: string;
  traineeEmail: string;
  traineePhone: string;
  traineeBusiness: string;
  attended: boolean;
  attendedAt: string | null;
  completedAt: string | null;
  selfCompleted: boolean;
  lessonCount: number;
  lessonsCompleted: number;
  lessons: TrainingLessonView[];
};

export type TrainingCertificateView = {
  enrollmentId: string;
  traineeName: string;
  courseTitle: string;
  sessionTitle: string;
  completedAt: string;
  providerName: string;
};

export type TrainingEnrollmentPrefill = {
  traineeName: string;
  traineeEmail: string;
  traineePhone: string;
  traineeBusiness: string;
};

export type ProviderEnrollmentRosterEntry = {
  id: string;
  courseId: string;
  courseTitle: string;
  sessionId: string;
  sessionTitle: string;
  sessionStartsAt: string;
  traineeName: string;
  traineeEmail: string;
  traineePhone: string;
  traineeBusiness: string;
  enrolledAt: string;
  status: TrainingEnrollmentStatus;
  attended: boolean;
  attendedAt: string | null;
  completedAt: string | null;
  lessonCount: number;
  lessonsCompleted: number;
};

export type TrainingProviderView = {
  id: string;
  displayName: string;
  bio: string;
};

export type TrainingPortalTab = "catalog" | "my-learning" | "provider";

const demoWhatsappLessons: TrainingLessonView[] = [
  {
    id: "demo-lesson-1",
    courseId: "demo-course-2",
    title: "Set up your business WhatsApp",
    notes: "Prepare your profile, labels, and a simple welcome message before the live session.",
    videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    sortOrder: 0,
    completed: true,
  },
  {
    id: "demo-lesson-2",
    courseId: "demo-course-2",
    title: "Follow-up cadence that converts",
    notes: "A three-touch sequence you can reuse after the workshop.",
    videoUrl: "",
    sortOrder: 1,
    completed: false,
  },
];

export const demoTrainingCourses: TrainingCourseView[] = [
  {
    id: "demo-course-1",
    title: "Funding Readiness for African SMEs",
    summary: "Prepare your business for grants, loans, and investor conversations.",
    description:
      "A practical 90-minute session covering financial records, pitch decks, and eligibility checklists for African markets.",
    flyerImageUrl: "",
    status: "published",
    providerName: "AfriGrow Academy",
    lessons: [
      {
        id: "demo-lesson-funding-1",
        courseId: "demo-course-1",
        title: "Records lenders actually ask for",
        notes: "A short checklist to gather before the live workshop.",
        videoUrl: "",
        sortOrder: 0,
        completed: false,
      },
    ],
    sessions: [
      {
        id: "demo-session-1",
        courseId: "demo-course-1",
        title: "Live workshop — March cohort",
        startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endsAt: null,
        zoomUrl: "https://zoom.us/j/demo",
        maxSeats: 30,
        status: "scheduled",
        enrollmentCount: 12,
        isEnrolled: false,
        enrollmentId: null,
        enrollmentStatus: null,
        hasPreviousAttempt: false,
      },
    ],
  },
  {
    id: "demo-course-2",
    title: "WhatsApp Marketing That Converts",
    summary: "Turn broadcasts and status posts into paying customers.",
    description:
      "Learn message templates, follow-up cadences, and compliance-friendly outreach for African SMEs.",
    flyerImageUrl: "",
    status: "published",
    providerName: "Growth Collective",
    lessons: demoWhatsappLessons,
    sessions: [
      {
        id: "demo-session-2",
        courseId: "demo-course-2",
        title: "Evening session",
        startsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        endsAt: null,
        zoomUrl: "https://zoom.us/j/demo2",
        maxSeats: 50,
        status: "scheduled",
        enrollmentCount: 8,
        isEnrolled: true,
        enrollmentId: "demo-enrollment-1",
        enrollmentStatus: "enrolled",
        hasPreviousAttempt: false,
      },
    ],
  },
];

export const demoMyEnrollments: TrainingEnrollmentView[] = [
  {
    id: "demo-enrollment-1",
    courseId: "demo-course-2",
    courseTitle: "WhatsApp Marketing That Converts",
    sessionId: "demo-session-2",
    sessionTitle: "Evening session",
    startsAt: demoTrainingCourses[1]!.sessions[0]!.startsAt,
    zoomUrl: "https://zoom.us/j/demo2",
    status: "enrolled",
    enrolledAt: new Date().toISOString(),
    traineeName: "Demo User",
    traineeEmail: "demo@example.com",
    traineePhone: "",
    traineeBusiness: "Demo Business",
    attended: true,
    attendedAt: new Date().toISOString(),
    completedAt: null,
    selfCompleted: false,
    lessonCount: demoWhatsappLessons.length,
    lessonsCompleted: demoWhatsappLessons.filter((lesson) => lesson.completed).length,
    lessons: demoWhatsappLessons,
  },
];

export const demoTrainingCertificate: TrainingCertificateView = {
  enrollmentId: "demo-enrollment-1",
  traineeName: "Demo User",
  courseTitle: "WhatsApp Marketing That Converts",
  sessionTitle: "Evening session",
  completedAt: new Date().toISOString(),
  providerName: "Growth Collective",
};

export function formatTrainingDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function isSessionUpcoming(startsAt: string): boolean {
  return new Date(startsAt).getTime() > Date.now();
}
