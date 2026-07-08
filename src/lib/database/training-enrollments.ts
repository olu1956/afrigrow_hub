export type TrainingEnrollmentStatus = "enrolled" | "completed" | "cancelled";

export type TrainingEnrollment = {
  id: string;
  course_id: string;
  session_id: string;
  user_id: string;
  business_id: string | null;
  status: TrainingEnrollmentStatus;
  enrolled_at: string;
};

export type TrainingEnrollmentInsert = Pick<
  TrainingEnrollment,
  "course_id" | "session_id" | "user_id"
> &
  Partial<Pick<TrainingEnrollment, "business_id" | "status">>;

export type TrainingEnrollmentUpdate = Partial<Pick<TrainingEnrollment, "status">>;

export const TRAINING_ENROLLMENTS_TABLE = "training_enrollments" as const;

export const TRAINING_ENROLLMENT_STATUSES: TrainingEnrollmentStatus[] = [
  "enrolled",
  "completed",
  "cancelled",
];
