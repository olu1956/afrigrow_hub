"use client";

import { useMemo, useState } from "react";
import { Bell, Plus, Search, Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  AddContactModal,
  LogFollowUpForm,
} from "@/components/crm/AddContactModal";
import { ContactDetail, ContactListItem } from "@/components/crm/ContactListItem";
import { FollowUpTimeline } from "@/components/crm/FollowUpTimeline";
import {
  filterContacts,
  filterTabs,
  initialContacts,
  isFollowUpDue,
  type Contact,
  type FilterTab,
  type FollowUpType,
} from "@/lib/crm-data";

export function CrmAgent() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(initialContacts[0]?.id ?? "");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const tabbed = filterContacts(contacts, filter);
    if (!search.trim()) return tabbed;
    const q = search.toLowerCase();
    return tabbed.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.business.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }, [contacts, filter, search]);

  const selected = contacts.find((c) => c.id === selectedId) ?? filtered[0];

  const dueCount = contacts.filter(isFollowUpDue).length;

  function handleAdd(data: {
    name: string;
    business: string;
    phone: string;
    email: string;
    status: Contact["status"];
    notes: string;
  }) {
    const id = `c-${Date.now()}`;
    const newContact: Contact = {
      id,
      ...data,
      source: "Manual entry",
      lastContact: "Just added",
      nextFollowUp: "Today",
      nextFollowUpType: "whatsapp",
      followUps: [],
    };
    setContacts((c) => [newContact, ...c]);
    setSelectedId(id);
  }

  function logFollowUp(type: FollowUpType, note: string) {
    if (!selected) return;
    const entry = {
      id: `f-${Date.now()}`,
      type,
      note,
      date: "Just now",
      completed: true,
    };
    setContacts((list) =>
      list.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              followUps: [entry, ...c.followUps],
              lastContact: "Just now",
              nextFollowUp: "In 3 days",
            }
          : c,
      ),
    );
  }

  function toggleFollowUp(followUpId: string) {
    if (!selected) return;
    setContacts((list) =>
      list.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              followUps: c.followUps.map((f) =>
                f.id === followUpId ? { ...f, completed: !f.completed } : f,
              ),
            }
          : c,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Customer Follow-Up CRM"
        description="Track contacts, log interactions, and never miss a follow-up."
        action={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            Add contact
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, label: "Total contacts", value: String(contacts.length) },
          { icon: Bell, label: "Follow-ups due", value: String(dueCount) },
          {
            icon: Users,
            label: "Customers",
            value: String(contacts.filter((c) => c.status === "customer").length),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <stat.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === tab.id
                ? "bg-primary text-white"
                : "border border-border bg-card text-muted hover:border-primary/30"
            }`}
          >
            {tab.label}
            {tab.id === "due" && dueCount > 0 && (
              <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] text-white">
                {dueCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search contacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="max-h-[520px] space-y-2 overflow-y-auto rounded-2xl border border-border bg-card p-3 shadow-sm">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">No contacts found.</p>
            ) : (
              filtered.map((contact) => (
                <ContactListItem
                  key={contact.id}
                  contact={contact}
                  selected={selected?.id === contact.id}
                  onSelect={() => setSelectedId(contact.id)}
                />
              ))
            )}
          </div>
        </div>

        <div className="space-y-5 lg:col-span-3">
          {selected ? (
            <>
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <ContactDetail contact={selected} />
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <LogFollowUpForm onLog={logFollowUp} />
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="mb-4 font-semibold text-foreground">Follow-up history</h3>
                <FollowUpTimeline
                  followUps={selected.followUps}
                  onToggle={toggleFollowUp}
                />
              </section>

              <section className="rounded-2xl border border-dashed border-primary/30 bg-primary-light/20 p-4">
                <p className="text-sm font-semibold text-primary">Automation (coming soon)</p>
                <p className="mt-1 text-xs text-muted">
                  Auto-send WhatsApp reminders 3 days after enquiry, thank-you messages after
                  purchase, and birthday offers — wired in a later phase.
                </p>
              </section>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card py-20 text-center">
              <p className="text-muted">Select a contact to view details</p>
            </div>
          )}
        </div>
      </div>

      <AddContactModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
