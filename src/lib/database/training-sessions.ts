export type TrainingSessionStatus = "scheduled" | "completed" | "cancelled";

export type TrainingSession = {
  id: string;
  course_id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  zoom_url: string;
  max_seats: number | null;
  status: TrainingSessionStatus;
  created_at: string;
};

export type TrainingSessionInsert = Pick<TrainingSession, "course_id" | "title" | "starts_at"> &
  Partial<Pick<TrainingSession, "ends_at" | "zoom_url" | "max_seats" | "status">>;

export type TrainingSessionUpdate = Partial<
  Pick<TrainingSession, "title" | "starts_at" | "ends_at" | "zoom_url" | "max_seats" | "status">
>;

export const TRAINING_SESSIONS_TABLE = "training_sessions" as const;

export const TRAINING_SESSION_STATUSES: TrainingSessionStatus[] = [
  "scheduled",
  "completed",
  "cancelled",
];
