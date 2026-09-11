"use client";

import Link from "next/link";
import { Award, CheckCircle2, Loader2 } from "lucide-react";
import { LessonVideoEmbed } from "@/components/training/LessonVideoEmbed";
import { formatProgrammeProgress, type TrainingEnrollmentView } from "@/lib/training-data";

export function EnrollmentProgramme({
  enrollment,
  togglingLessonId,
  completing,
  onToggleLesson,
  onMarkComplete,
}: {
  enrollment: TrainingEnrollmentView;
  togglingLessonId: string | null;
  completing: boolean;
  onToggleLesson: (lessonId: string, completed: boolean) => void;
  onMarkComplete: (enrollmentId: string) => void;
}) {
  const complete = enrollment.status === "completed";
  const lessons = enrollment.lessons ?? [];

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-border bg-background p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Programme</p>
          <p className="mt-1 text-sm text-foreground">
            {formatProgrammeProgress(
              enrollment.lessonsCompleted,
              enrollment.lessonCount,
              enrollment.attended || Boolean(enrollment.selfCompleted),
            )}
          </p>
          <p className="mt-1 text-xs text-muted">
            Mark the course complete when you have finished the live session and any modules.
          </p>
        </div>
        {complete ? (
          <Link
            href={`/dashboard/training/certificate/${enrollment.id}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-xs font-bold uppercase tracking-wide text-white"
          >
            <Award className="h-3.5 w-3.5" />
            Certificate
          </Link>
        ) : (
          <button
            type="button"
            disabled={completing}
            onClick={() => onMarkComplete(enrollment.id)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
          >
            {completing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Mark complete
          </button>
        )}
      </div>

      {lessons.length === 0 ? (
        <p className="text-sm text-muted">
          This is a live session. Click Mark complete when you have attended.
        </p>
      ) : (
        <ul className="space-y-3">
          {lessons.map((lesson, index) => {
            const busy = togglingLessonId === lesson.id;
            return (
              <li key={lesson.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {index + 1}. {lesson.title}
                    </p>
                    {lesson.notes ? (
                      <p className="mt-1 text-sm text-muted">{lesson.notes}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onToggleLesson(lesson.id, !lesson.completed)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide ${
                      lesson.completed
                        ? "border border-primary/30 bg-primary-light text-primary"
                        : "bg-primary text-white"
                    } disabled:opacity-50`}
                  >
                    {busy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : lesson.completed ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : null}
                    {lesson.completed ? "Completed" : "Mark complete"}
                  </button>
                </div>
                {lesson.videoUrl ? (
                  <div className="mt-3">
                    <LessonVideoEmbed url={lesson.videoUrl} title={lesson.title} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
