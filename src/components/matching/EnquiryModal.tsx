"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import {
  interestOptions,
  type MarketplaceListing,
} from "@/lib/matching-data";

type EnquiryModalProps = {
  listing: MarketplaceListing | null;
  onClose: () => void;
};

export function EnquiryModal({ listing, onClose }: EnquiryModalProps) {
  const [interest, setInterest] = useState(interestOptions[0]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!listing) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSent(true);
  }

  function handleClose() {
    setSent(false);
    setMessage("");
    setInterest(interestOptions[0]);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-label="Close enquiry"
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-semibold text-foreground">Send enquiry</h2>
            <p className="text-sm text-muted">To {listing.name}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-muted hover:bg-primary-light"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="px-5 py-10 text-center">
            <p className="font-semibold text-primary">Enquiry sent (preview)</p>
            <p className="mt-2 text-sm text-muted">
              {listing.name} will receive your message when messaging is connected
              in a later phase.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Type of enquiry
              </label>
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {interestOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Your message
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hi ${listing.name}, I'm interested in connecting regarding…`}
                className="w-full resize-y rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send enquiry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
