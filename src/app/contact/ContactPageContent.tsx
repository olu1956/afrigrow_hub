"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ContactForm } from "@/components/landing/ContactForm";
import { EnterpriseEnquiryForm } from "@/components/enterprise/EnterpriseEnquiryForm";

function ContactPageBody() {
  const searchParams = useSearchParams();
  const isEnterprise = searchParams.get("plan") === "enterprise";

  if (isEnterprise) {
    return <EnterpriseEnquiryForm />;
  }

  return <ContactForm />;
}

export function ContactPageContent() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-center text-sm text-muted">Loading…</div>}>
      <ContactPageBody />
    </Suspense>
  );
}
