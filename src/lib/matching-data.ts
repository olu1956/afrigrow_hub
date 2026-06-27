export type MatchType = "buyers" | "suppliers" | "partners";

export type MarketplaceMatchStatus =
  | "suggested"
  | "enquired"
  | "accepted"
  | "declined"
  | "archived";

export type ListingCategory =
  | "retail"
  | "manufacturing"
  | "services"
  | "events"
  | "food"
  | "tech";

export type MarketplaceListing = {
  id: string;
  name: string;
  tagline: string;
  category: ListingCategory;
  city: string;
  country: string;
  matchType: MatchType[];
  matchScore: number;
  lookingFor: string;
  services: string[];
  verified: boolean;
  matchStatus?: MarketplaceMatchStatus;
  source?: "live" | "demo";
};

export const matchTypeTabs: { id: MatchType; label: string; description: string }[] = [
  { id: "buyers", label: "Buyers", description: "Businesses looking to purchase" },
  { id: "suppliers", label: "Suppliers", description: "Source materials & products" },
  { id: "partners", label: "Partners", description: "Collaborate & grow together" },
];

export const categoryFilters: { value: ListingCategory | "all"; label: string }[] = [
  { value: "all", label: "All categories" },
  { value: "retail", label: "Retail & trading" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Services" },
  { value: "events", label: "Events" },
  { value: "food", label: "Food & hospitality" },
  { value: "tech", label: "Tech & digital" },
];

export const countryFilters = [
  "All countries",
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "UK",
];

export const marketplaceListings: MarketplaceListing[] = [
  {
    id: "m1",
    name: "Accra Fabrics Co.",
    tagline: "Wholesale African prints — MOQ from 50 yards",
    category: "manufacturing",
    city: "Accra",
    country: "Ghana",
    matchType: ["suppliers", "partners"],
    matchScore: 96,
    lookingFor: "Retail partners across West Africa",
    services: ["Wholesale fabrics", "Custom dye runs", "Export logistics"],
    verified: true,
  },
  {
    id: "m2",
    name: "Elegance Events NG",
    tagline: "Premium event styling & décor",
    category: "events",
    city: "Lagos",
    country: "Nigeria",
    matchType: ["buyers", "partners"],
    matchScore: 91,
    lookingFor: "Fabric suppliers for weddings & corporate events",
    services: ["Event styling", "Bridal packages", "Corporate décor"],
    verified: true,
  },
  {
    id: "m3",
    name: "Kibera Fashion House",
    tagline: "Contemporary African wear for retail",
    category: "retail",
    city: "Nairobi",
    country: "Kenya",
    matchType: ["buyers", "partners"],
    matchScore: 88,
    lookingFor: "Reliable fabric suppliers with unique prints",
    services: ["Ready-to-wear", "Boutique retail", "Online store"],
    verified: false,
  },
  {
    id: "m4",
    name: "Golden Thread Imports",
    tagline: "Bulk textile import & distribution",
    category: "manufacturing",
    city: "Lagos",
    country: "Nigeria",
    matchType: ["suppliers"],
    matchScore: 85,
    lookingFor: "Retailers to distribute premium stock",
    services: ["Import", "Warehousing", "Nationwide delivery"],
    verified: true,
  },
  {
    id: "m5",
    name: "Corporate Wear Solutions",
    tagline: "Uniforms for banks, hotels & airlines",
    category: "services",
    city: "Abuja",
    country: "Nigeria",
    matchType: ["buyers"],
    matchScore: 93,
    lookingFor: "Tailoring partners & fabric suppliers for bulk orders",
    services: ["Corporate uniforms", "Embroidery", "Fitting services"],
    verified: true,
  },
  {
    id: "m6",
    name: "Ubuntu Retail Group",
    tagline: "Multi-store fashion retail chain",
    category: "retail",
    city: "Johannesburg",
    country: "South Africa",
    matchType: ["buyers", "partners"],
    matchScore: 82,
    lookingFor: "Unique African fabric lines for 12 store locations",
    services: ["Fashion retail", "Franchise", "E-commerce"],
    verified: true,
  },
  {
    id: "m7",
    name: "Heritage Adire Collective",
    tagline: "Handcrafted adire & indigo specialists",
    category: "manufacturing",
    city: "Abeokuta",
    country: "Nigeria",
    matchType: ["suppliers", "partners"],
    matchScore: 90,
    lookingFor: "Stockists and collaborators for artisan collections",
    services: ["Hand-dyed adire", "Workshops", "Limited editions"],
    verified: false,
  },
  {
    id: "m8",
    name: "Diaspora Gift Co.",
    tagline: "African gifts shipped to UK & Europe",
    category: "retail",
    city: "London",
    country: "UK",
    matchType: ["buyers", "partners"],
    matchScore: 87,
    lookingFor: "Authentic fabric & textile suppliers in West Africa",
    services: ["E-commerce", "Gift boxes", "International shipping"],
    verified: true,
  },
];

export const categoryLabels: Record<ListingCategory, string> = {
  retail: "Retail & trading",
  manufacturing: "Manufacturing",
  services: "Services",
  events: "Events",
  food: "Food & hospitality",
  tech: "Tech & digital",
};

export type EnquiryForm = {
  message: string;
  interest: string;
};

export const interestOptions = [
  "Purchase / order enquiry",
  "Partnership proposal",
  "Supply arrangement",
  "General introduction",
];
