"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { followUpTypeLabels, type ContactStatus, type FollowUpType } from "@/lib/crm-data";

const sourceOptions = [
  "Manual entry",
  "Matching marketplace",
  "Referral",
  "Website enquiry",
  "Store visit",
  "Trade fair",
  "Social media",
  "Other",
];

type AddContactModalProps = {
  open: boolean;
  onClose: () => void;
  saving?: boolean;
  onAdd: (contact: {
    name: string;
    phone: string;
    email: string;
    source: string;
    status: ContactStatus;
    notes: string;
    nextFollowUp: string | null;
  }) => void | Promise<void>;
};

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function AddContactModal({ open, onClose, onAdd, saving = false }: AddContactModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("Manual entry");
  const [status, setStatus] = useState<ContactStatus>("lead");
  const [notes, setNotes] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);

    const nextFollowUp = nextFollowUpDate
      ? new Date(`${nextFollowUpDate}T09:00:00`).toISOString()
      : null;

    await onAdd({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      source,
      status,
      notes: notes.trim(),
      nextFollowUp,
    });

    setName("");
    setPhone("");
    setEmail("");
    setSource("Manual entry");
    setStatus("lead");
    setNotes("");
    setNextFollowUpDate("");
    setSubmitting(false);
    onClose();
  }

  const busy = saving || submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">Add contact</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-primary-light">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name *</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone</label>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Source</label>
            <select className={inputClass} value={source} onChange={(e) => setSource(e.target.value)}>
              {sourceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <select
                className={inputClass}
                value={status}
                onChange={(e) => setStatus(e.target.value as ContactStatus)}
              >
                <option value="lead">Lead</option>
                <option value="customer">Customer</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Next follow-up</label>
              <input
                type="date"
                className={inputClass}
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              rows={2}
              className={`${inputClass} resize-y`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add contact
          </button>
        </form>
      </div>
    </div>
  );
}

export function LogFollowUpForm({
  onLog,
  disabled = false,
  presetType = null,
}: {
  onLog: (type: FollowUpType, note: string) => void | Promise<void>;
  disabled?: boolean;
  presetType?: FollowUpType | null;
}) {
  const [type, setType] = useState<FollowUpType>("whatsapp");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const noteInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!presetType) return;
    setType(presetType);
    noteInputRef.current?.focus();
    noteInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [presetType]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;

    setSubmitting(true);
    await onLog(type, note.trim());
    setNote("");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-background p-4">
      <p className="text-sm font-semibold text-foreground">Log follow-up</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as FollowUpType)}
          disabled={disabled || submitting}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {Object.entries(followUpTypeLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input
          ref={noteInputRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What happened?"
          disabled={disabled || submitting}
          className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={disabled || submitting || !note.trim()}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Log"}
        </button>
      </div>
    </form>
  );
}
