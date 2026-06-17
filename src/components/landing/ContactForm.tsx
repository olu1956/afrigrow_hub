"use client";

import { FormEvent, useState } from "react";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          {[
            {
              icon: Mail,
              label: "Email",
              value: "hello@afrigrowhub.com",
            },
            {
              icon: Phone,
              label: "Phone",
              value: "+44 20 7946 0958",
            },
            {
              icon: MapPin,
              label: "Offices",
              value: "London, UK · Lagos, Nigeria · Nairobi, Kenya",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="mt-1 text-sm text-muted">{item.value}</p>
                </div>
              </div>
            );
          })}

          <div className="rounded-2xl border border-dashed border-border bg-primary-light/30 p-5">
            <div className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm text-muted">
                Contact form submissions are preview-only in Phase 1. A live
                support inbox will be connected in a later release.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-3">
          {submitted ? (
            <div className="rounded-2xl border border-primary/20 bg-primary-light p-6 text-center">
              <p className="font-semibold text-primary">Message sent (preview)</p>
              <p className="mt-2 text-sm text-muted">
                Thanks, {name || "there"}! We&apos;ll be in touch at {email || "your email"}{" "}
                once live messaging is enabled.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <h2 className="text-lg font-semibold text-foreground">Send a message</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <AuthInput
                  label="Your name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                />
                <AuthInput
                  label="Email address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourbusiness.com"
                  required
                />
              </div>
              <AuthInput
                label="Subject"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="How can we help?"
                required
              />
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your business or question…"
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <AuthButton loading={loading}>Send message</AuthButton>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
