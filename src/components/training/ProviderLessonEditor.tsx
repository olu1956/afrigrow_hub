"use client";

import { FormEvent, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  createLessonAction,
  deleteLessonAction,
  updateLessonAction,
} from "@/lib/auth/training-lms-actions";
import type { TrainingLessonView } from "@/lib/training-data";

export function ProviderLessonEditor({
  courseId,
  lessons,
  saving,
  onBusy,
  onError,
  onSuccess,
  onChanged,
}: {
  courseId: string;
  lessons: TrainingLessonView[];
  saving: boolean;
  onBusy: (busy: boolean) => void;
  onError: (message: string | null) => void;
  onSuccess: (message: string) => void;
  onChanged: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editOrder, setEditOrder] = useState("0");

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    onBusy(true);
    onError(null);
    const result = await createLessonAction({
      courseId,
      title,
      notes,
      videoUrl,
    });
    onBusy(false);
    if (!result.ok) {
      onError(result.error ?? "Could not add module.");
      return;
    }
    setTitle("");
    setNotes("");
    setVideoUrl("");
    onSuccess("Module added. Learners see it after they enroll.");
    await onChanged();
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    onBusy(true);
    onError(null);
    const result = await updateLessonAction({
      lessonId: editingId,
      title: editTitle,
      notes: editNotes,
      videoUrl: editVideoUrl,
      sortOrder: Number(editOrder),
    });
    onBusy(false);
    if (!result.ok) {
      onError(result.error ?? "Could not update module.");
      return;
    }
    setEditingId(null);
    onSuccess("Module updated.");
    await onChanged();
  }

  async function handleDelete(lessonId: string) {
    onBusy(true);
    onError(null);
    const result = await deleteLessonAction(lessonId);
    onBusy(false);
    if (!result.ok) {
      onError(result.error ?? "Could not delete module.");
      return;
    }
    if (editingId === lessonId) setEditingId(null);
    onSuccess("Module removed. Completion will refresh for enrolled members.");
    await onChanged();
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-border bg-background p-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Programme modules</p>
        <p className="mt-1 text-sm text-muted">
          Short lessons under this course. Optional YouTube or Vimeo link — AfriGrow does not host
          video yet.
        </p>
      </div>

      {lessons.length === 0 ? (
        <p className="text-sm text-muted">No modules yet. Add the first one below.</p>
      ) : (
        <ul className="space-y-2">
          {lessons.map((lesson, index) => (
            <li key={lesson.id} className="rounded-lg border border-border bg-card px-3 py-2">
              {editingId === lesson.id ? (
                <form onSubmit={handleSaveEdit} className="grid gap-2">
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">Title</span>
                    <input
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">Notes</span>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">YouTube / Vimeo link</span>
                    <input
                      type="url"
                      value={editVideoUrl}
                      onChange={(e) => setEditVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=…"
                      className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium text-foreground">Order</span>
                    <input
                      type="number"
                      min={0}
                      value={editOrder}
                      onChange={(e) => setEditOrder(e.target.value)}
                      className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-md bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
                    >
                      Save module
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-md border border-border px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {index + 1}. {lesson.title}
                    </p>
                    {lesson.notes ? (
                      <p className="mt-1 text-sm text-muted">{lesson.notes}</p>
                    ) : null}
                    {lesson.videoUrl ? (
                      <p className="mt-1 text-xs text-primary">Video link set</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setEditingId(lesson.id);
                        setEditTitle(lesson.title);
                        setEditNotes(lesson.notes);
                        setEditVideoUrl(lesson.videoUrl);
                        setEditOrder(String(lesson.sortOrder));
                      }}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-foreground"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleDelete(lesson.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-muted"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleCreate} className="grid gap-2 border-t border-border pt-3">
        <p className="text-sm font-semibold text-foreground">Add a module</p>
        <label className="block text-sm">
          <span className="font-medium text-foreground">Title</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">Notes (optional)</span>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-foreground">YouTube / Vimeo link (optional)</span>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-fit items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Add module
        </button>
      </form>
    </div>
  );
}
