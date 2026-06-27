"use client";

import { Mail, MessageCircle, Phone, User } from "lucide-react";
import type { Contact, FollowUpType } from "@/lib/crm-data";
import { followUpTypeLabels, statusLabels, statusStyles } from "@/lib/crm-data";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/crm/contact-links";

type ContactListItemProps = {
  contact: Contact;
  selected: boolean;
  onSelect: () => void;
};

export function ContactListItem({ contact, selected, onSelect }: ContactListItemProps) {
  const due =
    contact.nextFollowUp === "Today" || contact.nextFollowUp === "Overdue";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
        selected
          ? "border-primary bg-primary-light"
          : "border-border bg-background hover:border-primary/30"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          selected ? "bg-primary text-white" : "bg-primary-light text-primary"
        }`}
      >
        {contact.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-semibold text-foreground">{contact.name}</span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[contact.status]}`}
          >
            {statusLabels[contact.status]}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted">{contact.business}</span>
        <span
          className={`mt-1.5 inline-block text-xs font-medium ${
            contact.nextFollowUp === "Overdue"
              ? "text-red-600"
              : due
                ? "text-accent"
                : "text-muted"
          }`}
        >
          Follow-up: {contact.nextFollowUp} · {followUpTypeLabels[contact.nextFollowUpType]}
        </span>
      </span>
    </button>
  );
}

export function ContactDetail({
  contact,
  onMarkAsCustomer,
  onQuickFollowUp,
}: {
  contact: Contact;
  onMarkAsCustomer?: () => void;
  onQuickFollowUp?: (type: FollowUpType) => void;
}) {
  const whatsAppUrl = contact.phone ? buildWhatsAppUrl(contact.phone) : null;
  const telUrl = contact.phone ? buildTelUrl(contact.phone) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">
          {contact.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </span>
        <div>
          <h2 className="text-xl font-bold text-foreground">{contact.name}</h2>
          <p className="text-sm text-muted">{contact.business}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[contact.status]}`}
            >
              {statusLabels[contact.status]}
            </span>
            <span className="rounded-full bg-background px-2.5 py-0.5 text-xs text-muted">
              Source: {contact.source}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground hover:border-primary/30"
          >
            <Phone className="h-4 w-4 text-primary" />
            {contact.phone}
          </a>
        )}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground hover:border-primary/30"
          >
            <Mail className="h-4 w-4 text-primary" />
            {contact.email}
          </a>
        )}
      </div>

      {contact.notes && (
        <div className="rounded-xl bg-primary-light/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Notes</p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">{contact.notes}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {whatsAppUrl ? (
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white opacity-50"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </button>
        )}
        <button
          type="button"
          disabled={!telUrl}
          onClick={() => {
            if (telUrl) {
              window.location.href = telUrl;
            }
            onQuickFollowUp?.("call");
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/30 disabled:opacity-50"
        >
          <Phone className="h-4 w-4" />
          Log call
        </button>
        <button
          type="button"
          onClick={onMarkAsCustomer}
          disabled={contact.status === "customer" || !onMarkAsCustomer}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/30 disabled:opacity-50"
        >
          <User className="h-4 w-4" />
          {contact.status === "customer" ? "Already a customer" : "Mark as customer"}
        </button>
      </div>
    </div>
  );
}
