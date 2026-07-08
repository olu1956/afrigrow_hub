export type TrainingCourseStatus = "draft" | "published" | "archived";

export type TrainingCourse = {
  id: string;
  provider_id: string;
  provider_user_id: string;
  title: string;
  summary: string;
  description: string;
  status: TrainingCourseStatus;
  created_at: string;
  updated_at: string;
};

export type TrainingCourseInsert = Pick<
  TrainingCourse,
  "provider_id" | "provider_user_id" | "title"
> &
  Partial<Pick<TrainingCourse, "summary" | "description" | "status">>;

export type TrainingCourseUpdate = Partial<
  Pick<TrainingCourse, "title" | "summary" | "description" | "status" | "updated_at">
>;

export const TRAINING_COURSES_TABLE = "training_courses" as const;

export const TRAINING_COURSE_STATUSES: TrainingCourseStatus[] = [
  "draft",
  "published",
  "archived",
];
