export type ContactStatus = "lead" | "customer" | "inactive";

export type FollowUpType = "call" | "whatsapp" | "email" | "visit";

export type FollowUp = {
  id: string;
  type: FollowUpType;
  note: string;
  date: string;
  completed: boolean;
};

export type Contact = {
  id: string;
  name: string;
  business: string;
  phone: string;
  email: string;
  status: ContactStatus;
  source: string;
  lastContact: string;
  nextFollowUp: string;
  nextFollowUpType: FollowUpType;
  notes: string;
  followUps: FollowUp[];
};

export const statusLabels: Record<ContactStatus, string> = {
  lead: "Lead",
  customer: "Customer",
  inactive: "Inactive",
};

export const statusStyles: Record<ContactStatus, string> = {
  lead: "bg-accent-light text-accent",
  customer: "bg-primary-light text-primary",
  inactive: "bg-gray-100 text-muted",
};

export const followUpTypeLabels: Record<FollowUpType, string> = {
  call: "Phone call",
  whatsapp: "WhatsApp",
  email: "Email",
  visit: "In-person visit",
};

export const filterTabs = [
  { id: "all", label: "All contacts" },
  { id: "due", label: "Follow-up due" },
  { id: "leads", label: "Leads" },
  { id: "customers", label: "Customers" },
] as const;

export type FilterTab = (typeof filterTabs)[number]["id"];

export const initialContacts: Contact[] = [
  {
    id: "c1",
    name: "Chioma Adeyemi",
    business: "Elegance Events NG",
    phone: "+234 802 111 2233",
    email: "chioma@eleganceevents.ng",
    status: "customer",
    source: "Matching marketplace",
    lastContact: "3 days ago",
    nextFollowUp: "Today",
    nextFollowUpType: "whatsapp",
    notes: "Ordered 50 yards Ankara for December wedding. Interested in bulk discount.",
    followUps: [
      {
        id: "f1",
        type: "whatsapp",
        note: "Sent fabric catalogue for new arrivals",
        date: "3 days ago",
        completed: true,
      },
      {
        id: "f2",
        type: "call",
        note: "Discussed delivery timeline — confirmed Friday",
        date: "1 week ago",
        completed: true,
      },
    ],
  },
  {
    id: "c2",
    name: "Kwame Mensah",
    business: "Accra Fabrics Co.",
    phone: "+233 24 555 6677",
    email: "kwame@accrafabrics.com",
    status: "lead",
    source: "Referral",
    lastContact: "1 week ago",
    nextFollowUp: "Tomorrow",
    nextFollowUpType: "email",
    notes: "Potential wholesale supplier partnership. Asked for MOQ details.",
    followUps: [
      {
        id: "f3",
        type: "email",
        note: "Sent introduction and business profile",
        date: "1 week ago",
        completed: true,
      },
    ],
  },
  {
    id: "c3",
    name: "Fatima Bello",
    business: "Corporate Wear Solutions",
    phone: "+234 803 444 5566",
    email: "orders@corporatewear.ng",
    status: "lead",
    source: "Website enquiry",
    lastContact: "2 days ago",
    nextFollowUp: "Today",
    nextFollowUpType: "call",
    notes: "Needs 200 uniform sets — fabric + tailoring quote requested.",
    followUps: [
      {
        id: "f4",
        type: "call",
        note: "Initial enquiry call — sent pricing sheet",
        date: "2 days ago",
        completed: true,
      },
    ],
  },
  {
    id: "c4",
    name: "James Ochieng",
    business: "Kibera Fashion House",
    phone: "+254 712 333 4455",
    email: "james@kiberafashion.co.ke",
    status: "customer",
    source: "Trade fair",
    lastContact: "2 weeks ago",
    nextFollowUp: "Next week",
    nextFollowUpType: "whatsapp",
    notes: "Repeat buyer — 3 orders placed. Good candidate for loyalty offer.",
    followUps: [
      {
        id: "f5",
        type: "whatsapp",
        note: "Thank-you message after 3rd order",
        date: "2 weeks ago",
        completed: true,
      },
    ],
  },
  {
    id: "c5",
    name: "Aisha Mohammed",
    business: "Walk-in customer",
    phone: "+234 805 777 8899",
    email: "",
    status: "lead",
    source: "Store visit",
    lastContact: "5 days ago",
    nextFollowUp: "Overdue",
    nextFollowUpType: "whatsapp",
    notes: "Browsed adire collection, asked about custom colours. No purchase yet.",
    followUps: [],
  },
  {
    id: "c6",
    name: "David Thompson",
    business: "Diaspora Gift Co.",
    phone: "+44 7700 900123",
    email: "david@diasporagift.co.uk",
    status: "lead",
    source: "Matching marketplace",
    lastContact: "4 days ago",
    nextFollowUp: "In 3 days",
    nextFollowUpType: "email",
    notes: "UK buyer interested in authentic West African textiles for gift boxes.",
    followUps: [
      {
        id: "f6",
        type: "email",
        note: "Sent export pricing and shipping options",
        date: "4 days ago",
        completed: true,
      },
    ],
  },
];

export function isFollowUpDue(contact: Contact): boolean {
  return (
    contact.nextFollowUp === "Today" ||
    contact.nextFollowUp === "Overdue" ||
    contact.nextFollowUp === "Tomorrow"
  );
}

export function filterContacts(contacts: Contact[], tab: FilterTab): Contact[] {
  switch (tab) {
    case "due":
      return contacts.filter(isFollowUpDue);
    case "leads":
      return contacts.filter((c) => c.status === "lead");
    case "customers":
      return contacts.filter((c) => c.status === "customer");
    default:
      return contacts;
  }
}
