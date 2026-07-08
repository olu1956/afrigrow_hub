import type { TrainingCourseStatus } from "@/lib/database/training-courses";
import type { TrainingEnrollmentStatus } from "@/lib/database/training-enrollments";
import type { TrainingSessionStatus } from "@/lib/database/training-sessions";

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
  hasPreviousAttempt: boolean;
};

export type TrainingCourseView = {
  id: string;
  title: string;
  summary: string;
  description: string;
  status: TrainingCourseStatus;
  providerName: string;
  sessions: TrainingSessionView[];
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
};

export type TrainingProviderView = {
  id: string;
  displayName: string;
  bio: string;
};

export type TrainingPortalTab = "catalog" | "my-learning" | "provider";

export const demoTrainingCourses: TrainingCourseView[] = [
  {
    id: "demo-course-1",
    title: "Funding Readiness for African SMEs",
    summary: "Prepare your business for grants, loans, and investor conversations.",
    description:
      "A practical 90-minute session covering financial records, pitch decks, and eligibility checklists for African markets.",
    status: "published",
    providerName: "AfriGrow Academy",
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
    status: "published",
    providerName: "Growth Collective",
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
  },
];

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
