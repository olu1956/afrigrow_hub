export type EnterpriseEnquiryStatus = "new" | "contacted" | "qualified" | "won" | "closed";

export type EnterpriseEnquirySource =
  | "contact"
  | "billing"
  | "landing"
  | "pricing"
  | "partner"
  | "general";

export type EnterpriseEnquiryType = "enterprise" | "contact" | "partner";

export type EnterpriseEnquiry = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  team_size: string;
  locations: string;
  interested_in: string;
  message: string;
  subject: string;
  website: string;
  enquiry_type: EnterpriseEnquiryType;
  source: EnterpriseEnquirySource;
  status: EnterpriseEnquiryStatus;
  admin_notes: string;
  created_at: string;
};

export type EnterpriseEnquiryInsert = Pick<
  EnterpriseEnquiry,
  "name" | "email" | "message"
> &
  Partial<
    Pick<
      EnterpriseEnquiry,
      | "user_id"
      | "phone"
      | "company_name"
      | "team_size"
      | "locations"
      | "interested_in"
      | "subject"
      | "website"
      | "enquiry_type"
      | "source"
    >
  >;

export type EnterpriseEnquiryUpdate = Partial<
  Pick<EnterpriseEnquiry, "status" | "admin_notes">
>;

export const ENTERPRISE_ENQUIRIES_TABLE = "enterprise_enquiries" as const;

export const ENTERPRISE_ENQUIRY_STATUSES: EnterpriseEnquiryStatus[] = [
  "new",
  "contacted",
  "qualified",
  "won",
  "closed",
];

export const ENTERPRISE_ENQUIRY_SOURCES: EnterpriseEnquirySource[] = [
  "contact",
  "billing",
  "landing",
  "pricing",
  "partner",
  "general",
];

export const ENTERPRISE_ENQUIRY_TYPES: EnterpriseEnquiryType[] = [
  "enterprise",
  "contact",
  "partner",
];
