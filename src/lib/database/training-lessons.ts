export type TrainingLesson = {
  id: string;
  course_id: string;
  title: string;
  notes: string;
  video_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type TrainingLessonInsert = Pick<TrainingLesson, "course_id" | "title"> &
  Partial<Pick<TrainingLesson, "notes" | "video_url" | "sort_order">>;

export type TrainingLessonUpdate = Partial<
  Pick<TrainingLesson, "title" | "notes" | "video_url" | "sort_order">
>;

export const TRAINING_LESSONS_TABLE = "training_lessons" as const;
