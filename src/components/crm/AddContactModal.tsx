"use client";

import { FormEvent, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { followUpTypeLabels, type ContactStatus, type FollowUpType } from "@/lib/crm-data";

type AddContactModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (contact: {
    name: string;
    business: string;
    phone: string;
    email: string;
    status: ContactStatus;
    notes: string;
  }) => void;
};

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function AddContactModal({ open, onClose, onAdd }: AddContactModalProps) {
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<ContactStatus>("lead");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    onAdd({ name, business, phone, email, status, notes });
    setName("");
    setBusiness("");
    setPhone("");
    setEmail("");
    setStatus("lead");
    setNotes("");
    setSaving(false);
    onClose();
  }

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
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Business</label>
            <input className={inputClass} value={business} onChange={(e) => setBusiness(e.target.value)} />
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
            disabled={saving || !name.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add contact
          </button>
        </form>
      </div>
    </div>
  );
}

export function LogFollowUpForm({
  onLog,
}: {
  onLog: (type: FollowUpType, note: string) => void;
}) {
  const [type, setType] = useState<FollowUpType>("whatsapp");
  const [note, setNote] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    onLog(type, note.trim());
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-background p-4">
      <p className="text-sm font-semibold text-foreground">Log follow-up</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as FollowUpType)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {Object.entries(followUpTypeLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What happened?"
          className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={!note.trim()}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          Log
        </button>
      </div>
    </form>
  );
}
