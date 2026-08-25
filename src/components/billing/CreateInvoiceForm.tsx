"use client";

import { FormEvent, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  dashboardCardClass,
  marketingFieldBorderClass,
} from "@/components/dashboard/DashboardPageCanvas";
import { saveInvoiceAction } from "@/lib/auth/billing-actions";
import { validateEmail } from "@/lib/auth-validation";
import {
  calculateInvoiceTotals,
  formatInvoiceMoney,
} from "@/lib/billing/invoice-mapper";
import type { InvoiceStatus } from "@/lib/database/invoices";

const inputClass = `w-full rounded-xl ${marketingFieldBorderClass} bg-white px-4 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-foreground/45 hover:border-[#9fb0a8] focus:border-primary focus:ring-2 focus:ring-primary/20`;

type LineItemDraft = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

function createEmptyLineItem(): LineItemDraft {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: "1",
    unitPrice: "",
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

type CreateInvoiceFormProps = {
  disabled?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
};

export function CreateInvoiceForm({
  disabled = false,
  onSuccess,
  onError,
}: CreateInvoiceFormProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("20");
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([createEmptyLineItem()]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const parsedItems = useMemo(() => {
    return lineItems
      .map((item) => {
        const quantity = Number.parseFloat(item.quantity);
        const unitPrice = Number.parseFloat(item.unitPrice);
        const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
        const safeUnitPrice = Number.isFinite(unitPrice) && unitPrice >= 0 ? unitPrice : 0;

        return {
          description: item.description.trim(),
          quantity: safeQuantity,
          unit_price: safeUnitPrice,
          amount: Math.round(safeQuantity * safeUnitPrice * 100) / 100,
        };
      })
      .filter((item) => item.description && item.quantity > 0);
  }, [lineItems]);

  const totals = useMemo(() => {
    const rate = Number.parseFloat(taxRate);
    const taxRateDecimal = Number.isFinite(rate) && rate >= 0 ? rate / 100 : 0;
    return calculateInvoiceTotals(parsedItems, taxRateDecimal);
  }, [parsedItems, taxRate]);

  function updateLineItem(id: string, patch: Partial<LineItemDraft>) {
    setLineItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function addLineItem() {
    setLineItems((current) => [...current, createEmptyLineItem()]);
  }

  function removeLineItem(id: string) {
    setLineItems((current) =>
      current.length === 1 ? current : current.filter((item) => item.id !== id),
    );
  }

  function resetForm() {
    setClientName("");
    setClientEmail("");
    setDueDate("");
    setTaxRate("20");
    setLineItems([createEmptyLineItem()]);
    setFormError(null);
  }

  async function handleSubmit(status: InvoiceStatus) {
    setFormError(null);

    if (!clientName.trim()) {
      setFormError("Enter the client name.");
      return;
    }

    if (parsedItems.length === 0) {
      setFormError("Add at least one line item with a description, quantity, and price.");
      return;
    }

    if (status === "sent") {
      const emailError = validateEmail(clientEmail);
      if (emailError) {
        setFormError("Enter a valid client email so AfriGrow can send this invoice.");
        return;
      }
    }

    setSaving(true);

    const rate = Number.parseFloat(taxRate);
    const result = await saveInvoiceAction({
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      items: parsedItems,
      status,
      dueDate: dueDate || null,
      taxRate: Number.isFinite(rate) && rate >= 0 ? rate / 100 : 0,
    });

    setSaving(false);

    if (!result.ok) {
      const message = result.error ?? "Could not save invoice.";
      setFormError(message);
      onError?.(message);
      return;
    }

    const label = result.warning
      ? result.warning
      : status === "sent"
        ? result.emailed
          ? `Invoice emailed to ${clientEmail.trim()}.`
          : "Invoice saved and marked as sent."
        : "Invoice saved as draft.";

    resetForm();
    onSuccess?.(label);
  }

  function onFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSubmit("draft");
  }

  return (
    <section className={dashboardCardClass}>
      <div className="mb-5">
        <h2 className="font-semibold text-foreground">Create invoice</h2>
        <p className="mt-1 text-sm text-muted">
          Bill a client and track it in your invoice history. Save &amp; mark sent
          emails the client from AfriGrow (you get a copy).
        </p>
      </div>

      <form onSubmit={onFormSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Client name">
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client or company name"
              className={inputClass}
              disabled={disabled || saving}
            />
          </Field>
          <Field label="Client email">
            <input
              type="email"
              required
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@example.com"
              className={inputClass}
              disabled={disabled || saving}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Due date">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
              disabled={disabled || saving}
            />
          </Field>
          <Field label="Tax rate (%)">
            <input
              type="number"
              min="0"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className={inputClass}
              disabled={disabled || saving}
            />
          </Field>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">Line items</p>
            <button
              type="button"
              onClick={addLineItem}
              disabled={disabled || saving}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-primary hover:bg-primary-light disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Add item
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => {
              const quantity = Number.parseFloat(item.quantity);
              const unitPrice = Number.parseFloat(item.unitPrice);
              const lineTotal =
                Number.isFinite(quantity) && Number.isFinite(unitPrice)
                  ? quantity * unitPrice
                  : 0;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Item {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      disabled={disabled || saving || lineItems.length === 1}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                      aria-label={`Remove item ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-12">
                    <div className="sm:col-span-6">
                      <Field label="Description">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(item.id, { description: e.target.value })
                          }
                          placeholder="Service or product"
                          className={inputClass}
                          disabled={disabled || saving}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Qty">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(item.id, { quantity: e.target.value })
                          }
                          className={inputClass}
                          disabled={disabled || saving}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Unit price">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateLineItem(item.id, { unitPrice: e.target.value })
                          }
                          placeholder="0.00"
                          className={inputClass}
                          disabled={disabled || saving}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Amount">
                        <div className="flex h-[42px] items-center rounded-xl border border-border bg-primary-light/40 px-3 text-sm font-semibold text-foreground">
                          {formatInvoiceMoney(lineTotal)}
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-medium text-foreground">
              {formatInvoiceMoney(totals.subtotal)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted">Tax</span>
            <span className="font-medium text-foreground">
              {formatInvoiceMoney(totals.tax)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold text-primary">
              {formatInvoiceMoney(totals.total)}
            </span>
          </div>
        </div>

        {formError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={disabled || saving}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white py-3 text-sm font-semibold text-primary transition hover:bg-primary-light disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save as draft
          </button>
          <button
            type="button"
            disabled={disabled || saving}
            onClick={() => void handleSubmit("sent")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save &amp; mark sent
          </button>
        </div>
      </form>
    </section>
  );
}
