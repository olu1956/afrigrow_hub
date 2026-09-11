export type TrainingLessonProgress = {
  id: string;
  lesson_id: string;
  user_id: string;
  completed_at: string;
};

export const TRAINING_LESSON_PROGRESS_TABLE = "training_lesson_progress" as const;
