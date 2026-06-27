import type {
  EnterpriseEnquiry,
  EnterpriseEnquiryStatus,
  EnterpriseEnquiryType,
} from "@/lib/database/enterprise-enquiries";

export type EnterpriseEnquiryView = {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  teamSize: string;
  locations: string;
  interestedIn: string[];
  subject: string;
  website: string;
  enquiryType: EnterpriseEnquiryType;
  message: string;
  source: EnterpriseEnquiry["source"];
  status: EnterpriseEnquiryStatus;
  adminNotes: string;
  createdAt: string;
  createdLabel: string;
};

const statusLabels: Record<EnterpriseEnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  closed: "Closed",
};

const typeLabels: Record<EnterpriseEnquiryType, string> = {
  enterprise: "Enterprise",
  contact: "Contact",
  partner: "Partner",
};

export function enterpriseEnquiryStatusLabel(status: EnterpriseEnquiryStatus): string {
  return statusLabels[status];
}

export function enterpriseEnquiryTypeLabel(type: EnterpriseEnquiryType): string {
  return typeLabels[type];
}

export function formatEnquiryCreatedAt(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function parseInterestedIn(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializeInterestedIn(values: string[]): string {
  return values.join(", ");
}

export function mapEnterpriseEnquiry(row: EnterpriseEnquiry): EnterpriseEnquiryView {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    companyName: row.company_name,
    teamSize: row.team_size,
    locations: row.locations,
    interestedIn: parseInterestedIn(row.interested_in),
    subject: row.subject ?? "",
    website: row.website ?? "",
    enquiryType: row.enquiry_type ?? "enterprise",
    message: row.message,
    source: row.source,
    status: row.status,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    createdLabel: formatEnquiryCreatedAt(row.created_at),
  };
}

export function enquiryListTitle(enquiry: EnterpriseEnquiryView): string {
  if (enquiry.enquiryType === "contact") {
    return enquiry.subject || enquiry.name;
  }

  return enquiry.companyName || enquiry.name;
}
