export type TrainingEnrollmentStatus = "enrolled" | "completed" | "cancelled";

export type TrainingEnrollment = {
  id: string;
  course_id: string;
  session_id: string;
  user_id: string;
  business_id: string | null;
  trainee_name: string;
  trainee_email: string;
  trainee_phone: string;
  trainee_business: string;
  status: TrainingEnrollmentStatus;
  enrolled_at: string;
};

export type TrainingEnrollmentInsert = Pick<
  TrainingEnrollment,
  "course_id" | "session_id" | "user_id"
> &
  Partial<
    Pick<
      TrainingEnrollment,
      | "business_id"
      | "status"
      | "trainee_name"
      | "trainee_email"
      | "trainee_phone"
      | "trainee_business"
    >
  >;

export type TrainingEnrollmentUpdate = Partial<Pick<TrainingEnrollment, "status">>;

export const TRAINING_ENROLLMENTS_TABLE = "training_enrollments" as const;

export const TRAINING_ENROLLMENT_STATUSES: TrainingEnrollmentStatus[] = [
  "enrolled",
  "completed",
  "cancelled",
];
