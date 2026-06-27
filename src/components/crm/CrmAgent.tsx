"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bell, Loader2, Plus, Search, Users } from "lucide-react";
import { DashboardPageLayout } from "@/components/dashboard/DashboardPageLayout";
import { DashboardStatGrid } from "@/components/dashboard/DashboardPageCanvas";
import {
  AddContactModal,
  LogFollowUpForm,
} from "@/components/crm/AddContactModal";
import { ContactDetail, ContactListItem } from "@/components/crm/ContactListItem";
import { FollowUpTimeline } from "@/components/crm/FollowUpTimeline";
import { useSession } from "@/components/providers/SessionProvider";
import {
  createLeadAction,
  getLeadsAction,
  logLeadFollowUpAction,
  toggleLeadFollowUpAction,
  updateLeadAction,
} from "@/lib/auth/crm-actions";
import {
  demoContacts,
  filterContacts,
  filterTabs,
  isFollowUpDue,
  type Contact,
  type FilterTab,
  type FollowUpType,
} from "@/lib/crm-data";

export function CrmAgent() {
  const { hydrated, authEnabled } = useSession();
  const initialized = useRef(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(authEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupWarning, setSetupWarning] = useState<string | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);
  const [followUpPreset, setFollowUpPreset] = useState<FollowUpType | null>(null);

  useEffect(() => {
    if (!hydrated || initialized.current) return;

    async function loadLeads() {
      setLoading(true);
      setError(null);

      if (!authEnabled) {
        setContacts(demoContacts);
        setSelectedId(demoContacts[0]?.id ?? "");
        setUsingDemo(true);
        setLoading(false);
        initialized.current = true;
        return;
      }

      const result = await getLeadsAction();
      if (result.warning) {
        setSetupWarning(result.warning);
      }

      if (!result.ok) {
        setError(result.error ?? "Could not load leads.");
        setContacts([]);
        setLoading(false);
        initialized.current = true;
        return;
      }

      const loaded = result.contacts ?? [];
      setContacts(loaded);
      setSelectedId(loaded[0]?.id ?? "");
      setUsingDemo(false);
      setLoading(false);
      initialized.current = true;
    }

    loadLeads();
  }, [authEnabled, hydrated]);

  const filtered = useMemo(() => {
    const tabbed = filterContacts(contacts, filter);
    if (!search.trim()) return tabbed;
    const q = search.toLowerCase();
    return tabbed.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.business.toLowerCase().includes(q) ||
        c.source.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }, [contacts, filter, search]);

  const selected = contacts.find((c) => c.id === selectedId) ?? filtered[0];

  const dueCount = contacts.filter(isFollowUpDue).length;

  function replaceContact(updated: Contact) {
    setContacts((list) => list.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function handleAdd(data: {
    name: string;
    phone: string;
    email: string;
    source: string;
    status: Contact["status"];
    notes: string;
    nextFollowUp: string | null;
  }) {
    if (!authEnabled || usingDemo) {
      const id = `c-${Date.now()}`;
      const newContact: Contact = {
        id,
        name: data.name,
        business: data.source,
        phone: data.phone,
        email: data.email,
        status: data.status,
        source: data.source,
        notes: data.notes,
        lastContact: "Just added",
        nextFollowUp: data.nextFollowUp ? "Today" : "Not scheduled",
        nextFollowUpType: "whatsapp",
        followUps: [],
      };
      setContacts((c) => [newContact, ...c]);
      setSelectedId(id);
      return;
    }

    setSaving(true);
    setError(null);

    const result = await createLeadAction({
      name: data.name,
      phone: data.phone,
      email: data.email,
      source: data.source,
      status: data.status,
      notes: data.notes,
      nextFollowUp: data.nextFollowUp,
    });

    setSaving(false);

    if (!result.ok || !result.contact) {
      setError(result.error ?? "Could not add lead.");
      return;
    }

    setContacts((list) => [result.contact!, ...list]);
    setSelectedId(result.contact.id);
  }

  async function logFollowUp(type: FollowUpType, note: string) {
    if (!selected) return;

    if (!authEnabled || usingDemo) {
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
      return;
    }

    setSaving(true);
    setError(null);

    const result = await logLeadFollowUpAction({
      id: selected.id,
      type,
      note,
    });

    setSaving(false);

    if (!result.ok || !result.contact) {
      setError(result.error ?? "Could not log follow-up.");
      return;
    }

    replaceContact(result.contact);
  }

  async function toggleFollowUp(followUpId: string) {
    if (!selected) return;

    const target = selected.followUps.find((item) => item.id === followUpId);
    if (!target) return;

    if (!authEnabled || usingDemo) {
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
      return;
    }

    setSaving(true);
    setError(null);

    const result = await toggleLeadFollowUpAction({
      id: selected.id,
      followUpId,
      completed: !target.completed,
    });

    setSaving(false);

    if (!result.ok || !result.contact) {
      setError(result.error ?? "Could not update follow-up.");
      return;
    }

    replaceContact(result.contact);
  }

  async function markAsCustomer() {
    if (!selected || selected.status === "customer") return;

    if (!authEnabled || usingDemo) {
      setContacts((list) =>
        list.map((c) => (c.id === selected.id ? { ...c, status: "customer" } : c)),
      );
      return;
    }

    setSaving(true);
    setError(null);

    const result = await updateLeadAction({
      id: selected.id,
      status: "customer",
    });

    setSaving(false);

    if (!result.ok || !result.contact) {
      setError(result.error ?? "Could not update lead.");
      return;
    }

    replaceContact(result.contact);
  }

  return (
    <DashboardPageLayout
      title="Customer Follow-Up CRM"
      description="Track contacts, log interactions, and never miss a follow-up."
      action={
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          disabled={loading || saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Add contact
        </button>
      }
      heroFooter={
        <DashboardStatGrid
          stats={[
            { icon: Users, label: "Total contacts", value: String(contacts.length) },
            { icon: Bell, label: "Follow-ups due", value: String(dueCount) },
            {
              icon: Users,
              label: "Customers",
              value: String(contacts.filter((c) => c.status === "customer").length),
            },
          ]}
        />
      }
    >
      {setupWarning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {setupWarning}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading contacts…
        </div>
      ) : (
        <>
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
                  <p className="py-8 text-center text-sm text-muted">
                    {contacts.length === 0
                      ? "No leads yet. Add your first contact to get started."
                      : "No contacts found."}
                  </p>
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
                    <ContactDetail
                      contact={selected}
                      onMarkAsCustomer={markAsCustomer}
                      onQuickFollowUp={(type) => setFollowUpPreset(type)}
                    />
                  </section>

                  <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <LogFollowUpForm
                      onLog={logFollowUp}
                      disabled={saving}
                      presetType={followUpPreset}
                    />
                  </section>

                  <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="mb-4 font-semibold text-foreground">Follow-up history</h3>
                    <FollowUpTimeline followUps={selected.followUps} onToggle={toggleFollowUp} />
                  </section>

                  <section className="rounded-2xl border border-dashed border-primary/30 bg-primary-light/20 p-4">
                    <p className="text-sm font-semibold text-primary">Scheduled messages</p>
                    <p className="mt-1 text-xs text-muted">
                      Logged follow-ups are saved to your database. Automated WhatsApp and email
                      sends will use scheduled messages in a later phase.
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
        </>
      )}

      <AddContactModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
        saving={saving}
      />
    </DashboardPageLayout>
  );
}
