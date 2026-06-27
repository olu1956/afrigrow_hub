import {
  categoryLabels,
  countryFilters,
  type ListingCategory,
} from "@/lib/matching-data";

export type { ListingCategory };
export { categoryLabels, countryFilters };

export type DirectoryListing = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: ListingCategory;
  city: string;
  country: string;
  services: string[];
  verified: boolean;
  featured: boolean;
  memberSince: string;
  createdAt?: string;
  profileViews: number;
  rating: number;
  reviewCount: number;
  profileScore?: number;
  logoUrl?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  phone?: string;
  source: "live" | "sample";
};

export const categoryFilters: { value: ListingCategory | "all"; label: string }[] = [
  { value: "all", label: "All categories" },
  { value: "retail", label: "Retail & trading" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Services" },
  { value: "events", label: "Events" },
  { value: "food", label: "Food & hospitality" },
  { value: "tech", label: "Tech & digital" },
];

export const sortOptions = [
  { value: "featured", label: "Featured first" },
  { value: "views", label: "Most viewed" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest members" },
  { value: "name", label: "A–Z" },
] as const;

export type SortOption = (typeof sortOptions)[number]["value"];

export const directoryListings: DirectoryListing[] = [
  {
    id: "d1",
    name: "Amara's Textiles",
    tagline: "Premium African fabrics & bespoke tailoring",
    description:
      "Family-run textile business specialising in Ankara, lace, and custom bridal wear. Serving Lagos and nationwide delivery since 2018.",
    category: "retail",
    city: "Lagos",
    country: "Nigeria",
    services: ["Fabric retail", "Custom tailoring", "Wholesale"],
    verified: true,
    featured: true,
    memberSince: "Jan 2024",
    profileViews: 1240,
    rating: 4.9,
    reviewCount: 38,
    source: "sample",
  },
  {
    id: "d2",
    name: "Accra Fabrics Co.",
    tagline: "Wholesale African prints — MOQ from 50 yards",
    description:
      "West Africa's trusted wholesale fabric partner with export logistics and custom dye runs for retailers and designers.",
    category: "manufacturing",
    city: "Accra",
    country: "Ghana",
    services: ["Wholesale fabrics", "Custom dye runs", "Export logistics"],
    verified: true,
    featured: true,
    memberSince: "Mar 2023",
    profileViews: 2180,
    rating: 4.8,
    reviewCount: 52,
    source: "sample",
  },
  {
    id: "d3",
    name: "Elegance Events NG",
    tagline: "Premium event styling & décor",
    description:
      "Award-winning event styling studio for weddings, corporate galas, and brand activations across Nigeria.",
    category: "events",
    city: "Lagos",
    country: "Nigeria",
    services: ["Event styling", "Bridal packages", "Corporate décor"],
    verified: true,
    featured: false,
    memberSince: "Jun 2023",
    profileViews: 890,
    rating: 4.7,
    reviewCount: 24,
    source: "sample",
  },
  {
    id: "d4",
    name: "Kibera Fashion House",
    tagline: "Contemporary African wear for retail",
    description:
      "Boutique fashion label blending traditional East African textiles with modern silhouettes for retail and online.",
    category: "retail",
    city: "Nairobi",
    country: "Kenya",
    services: ["Ready-to-wear", "Boutique retail", "Online store"],
    verified: false,
    featured: false,
    memberSince: "Sep 2024",
    profileViews: 456,
    rating: 4.5,
    reviewCount: 11,
    source: "sample",
  },
  {
    id: "d5",
    name: "Golden Thread Imports",
    tagline: "Bulk textile import & distribution",
    description:
      "Import and warehousing specialists distributing premium textiles to retailers across Nigeria with nationwide delivery.",
    category: "manufacturing",
    city: "Lagos",
    country: "Nigeria",
    services: ["Import", "Warehousing", "Nationwide delivery"],
    verified: true,
    featured: false,
    memberSince: "Feb 2023",
    profileViews: 1560,
    rating: 4.6,
    reviewCount: 31,
    source: "sample",
  },
  {
    id: "d6",
    name: "Corporate Wear Solutions",
    tagline: "Uniforms for banks, hotels & airlines",
    description:
      "End-to-end corporate uniform provider with embroidery, fitting services, and bulk order management.",
    category: "services",
    city: "Abuja",
    country: "Nigeria",
    services: ["Corporate uniforms", "Embroidery", "Fitting services"],
    verified: true,
    featured: true,
    memberSince: "Nov 2022",
    profileViews: 1920,
    rating: 4.9,
    reviewCount: 44,
    source: "sample",
  },
  {
    id: "d7",
    name: "Ubuntu Retail Group",
    tagline: "Multi-store fashion retail chain",
    description:
      "12-location fashion retail chain sourcing unique African fabric lines for franchise and e-commerce partners.",
    category: "retail",
    city: "Johannesburg",
    country: "South Africa",
    services: ["Fashion retail", "Franchise", "E-commerce"],
    verified: true,
    featured: false,
    memberSince: "Apr 2023",
    profileViews: 1340,
    rating: 4.7,
    reviewCount: 29,
    source: "sample",
  },
  {
    id: "d8",
    name: "Heritage Adire Collective",
    tagline: "Handcrafted adire & indigo specialists",
    description:
      "Artisan collective preserving traditional adire techniques with workshops and limited-edition collections.",
    category: "manufacturing",
    city: "Abeokuta",
    country: "Nigeria",
    services: ["Hand-dyed adire", "Workshops", "Limited editions"],
    verified: false,
    featured: false,
    memberSince: "Aug 2024",
    profileViews: 620,
    rating: 4.8,
    reviewCount: 16,
    source: "sample",
  },
  {
    id: "d9",
    name: "Diaspora Gift Co.",
    tagline: "African gifts shipped to UK & Europe",
    description:
      "Curated African gift boxes and textiles shipped internationally from London with West African supplier network.",
    category: "retail",
    city: "London",
    country: "UK",
    services: ["E-commerce", "Gift boxes", "International shipping"],
    verified: true,
    featured: false,
    memberSince: "Jan 2023",
    profileViews: 980,
    rating: 4.6,
    reviewCount: 22,
    source: "sample",
  },
  {
    id: "d10",
    name: "Savanna Bites Catering",
    tagline: "Corporate & event catering across East Africa",
    description:
      "Full-service catering for conferences, weddings, and corporate events with farm-to-table African cuisine.",
    category: "food",
    city: "Nairobi",
    country: "Kenya",
    services: ["Event catering", "Corporate lunches", "Menu design"],
    verified: true,
    featured: false,
    memberSince: "May 2024",
    profileViews: 540,
    rating: 4.4,
    reviewCount: 18,
    source: "sample",
  },
  {
    id: "d11",
    name: "PayFlow Africa",
    tagline: "Payment tools built for African SMEs",
    description:
      "Fintech platform helping small businesses accept mobile money, cards, and invoicing with simple dashboards.",
    category: "tech",
    city: "Lagos",
    country: "Nigeria",
    services: ["Payments", "Invoicing", "POS integration"],
    verified: true,
    featured: false,
    memberSince: "Jul 2024",
    profileViews: 710,
    rating: 4.5,
    reviewCount: 14,
    source: "sample",
  },
  {
    id: "d12",
    name: "Cape Coast Artisans",
    tagline: "Handwoven kente & ceremonial textiles",
    description:
      "Master weavers producing authentic kente cloth for ceremonies, institutions, and international collectors.",
    category: "manufacturing",
    city: "Cape Coast",
    country: "Ghana",
    services: ["Kente weaving", "Custom orders", "Cultural workshops"],
    verified: true,
    featured: false,
    memberSince: "Dec 2022",
    profileViews: 1120,
    rating: 4.9,
    reviewCount: 36,
    source: "sample",
  },
];

export function buildCountryFilters(listings: DirectoryListing[]): string[] {
  const countries = new Set<string>();
  for (const listing of listings) {
    if (listing.country.trim()) countries.add(listing.country.trim());
  }

  return ["All countries", ...[...countries].sort((a, b) => a.localeCompare(b))];
}

export function mergeDirectoryListings(
  live: DirectoryListing[],
  samples: DirectoryListing[],
  includeSamples: boolean,
): DirectoryListing[] {
  if (!includeSamples) return live;

  const liveNames = new Set(live.map((listing) => listing.name.toLowerCase()));
  const dedupedSamples = samples.filter(
    (listing) => !liveNames.has(listing.name.toLowerCase()),
  );

  return [...live, ...dedupedSamples];
}

export function filterDirectoryListings(
  listings: DirectoryListing[],
  options: {
    category: ListingCategory | "all";
    country: string;
    search: string;
    sort: SortOption;
  },
): DirectoryListing[] {
  const q = options.search.trim().toLowerCase();

  const filtered = listings
    .filter((l) => options.category === "all" || l.category === options.category)
    .filter((l) => options.country === "All countries" || l.country === options.country)
    .filter((l) => {
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.tagline.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.services.some((s) => s.toLowerCase().includes(q))
      );
    });

  return [...filtered].sort((a, b) => {
    switch (options.sort) {
      case "featured":
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.profileViews - a.profileViews;
      case "views":
        return b.profileViews - a.profileViews;
      case "rating":
        return b.rating - a.rating || b.reviewCount - a.reviewCount;
      case "newest": {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (aTime !== bTime) return bTime - aTime;
        return b.memberSince.localeCompare(a.memberSince);
      }
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
}
