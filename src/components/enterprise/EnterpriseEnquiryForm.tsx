"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, Loader2, Mail, MapPin, Phone, Users } from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { submitEnterpriseEnquiryAction } from "@/lib/auth/enterprise-enquiry-actions";
import type { EnterpriseEnquirySource } from "@/lib/database/enterprise-enquiries";

const teamSizeOptions = [
  { value: "", label: "Select team size" },
  { value: "1-5", label: "1–5 people" },
  { value: "6-20", label: "6–20 people" },
  { value: "21-50", label: "21–50 people" },
  { value: "50+", label: "50+ people" },
];

const locationOptions = [
  { value: "", label: "Select locations" },
  { value: "1", label: "1 location" },
  { value: "2-5", label: "2–5 locations" },
  { value: "6+", label: "6+ locations" },
];

const interestOptions = [
  "Multi-location profiles",
  "Dedicated agent tuning",
  "API & integrations",
  "Team seats & roles",
  "Priority support",
];

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export function EnterpriseEnquiryForm() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [locations, setLocations] = useState("");
  const [interestedIn, setInterestedIn] = useState<string[]>([
    "Team seats & roles",
    "Multi-location profiles",
  ]);
  const [message, setMessage] = useState(
    "Hi, I would like to discuss AfriGrow Hub Enterprise pricing for my business.",
  );
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const source = searchParams.get("source");
    if (source === "billing") {
      setMessage(
        (current) =>
          current ||
          "Hi, I am interested in Enterprise pricing after reviewing plans on the billing page.",
      );
    }
  }, [searchParams]);

  function toggleInterest(option: string) {
    setInterestedIn((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const source = (searchParams.get("source") ?? "contact") as EnterpriseEnquirySource;
    const result = await submitEnterpriseEnquiryAction({
      name,
      email,
      phone,
      companyName,
      teamSize,
      locations,
      interestedIn,
      message,
      source: ["contact", "billing", "landing", "pricing"].includes(source)
        ? source
        : "contact",
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Could not submit your enquiry.");
      return;
    }

    setSubmitted(true);
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-primary/20 bg-primary-light/40 p-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Enterprise
            </p>
            <h2 className="mt-2 text-xl font-bold text-foreground">
              Built for teams, locations, and scale
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Tell us about your business and we&apos;ll follow up with a tailored Enterprise
              package — team access, multi-location setup, and priority support.
            </p>
          </div>

          {[
            { icon: Mail, label: "Email", value: "hello@afrigrowhub.com" },
            { icon: Phone, label: "Phone", value: "+44 20 7946 0958" },
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
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-3">
          {submitted ? (
            <div className="rounded-2xl border border-primary/20 bg-primary-light p-6 text-center">
              <p className="font-semibold text-primary">Enquiry received</p>
              <p className="mt-2 text-sm text-muted">
                Thanks, {name}. Our team will review your Enterprise request and contact you at{" "}
                {email} within 2 business days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Enterprise enquiry</h2>
              </div>

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
                  label="Work email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <AuthInput
                  label="Phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7700 900000"
                />
                <AuthInput
                  label="Company name"
                  name="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your business or group"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="teamSize" className="text-sm font-medium text-foreground">
                    Team size
                  </label>
                  <select
                    id="teamSize"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className={inputClass}
                    required
                  >
                    {teamSizeOptions.map((option) => (
                      <option key={option.value || "placeholder"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="locations" className="text-sm font-medium text-foreground">
                    Locations
                  </label>
                  <select
                    id="locations"
                    value={locations}
                    onChange={(e) => setLocations(e.target.value)}
                    className={inputClass}
                    required
                  >
                    {locationOptions.map((option) => (
                      <option key={option.value || "placeholder"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <fieldset className="space-y-3">
                <legend className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  What matters most to you?
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {interestOptions.map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={interestedIn.includes(option)}
                        onChange={() => toggleInterest(option)}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">
                  Tell us about your needs
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className={`${inputClass} resize-y`}
                />
              </div>

              {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <AuthButton loading={loading}>Submit Enterprise enquiry</AuthButton>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
