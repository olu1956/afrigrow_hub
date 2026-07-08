export type PartnerOffer = {
  id: string;
  name: string;
  category: string;
  headline: string;
  description: string;
  offer?: string;
  ctaLabel?: string;
  ctaHref?: string;
  logoSrc?: string;
  verified?: boolean;
  /** Tailwind gradient classes for the card visual area */
  cardTheme: string;
};

export const partnerOffers: PartnerOffer[] = [
  {
    id: "loadofs",
    name: "Loadofs",
    category: "Culture & education",
    headline: "Stories, heritage, and learning for African communities",
    description:
      "Loadofs brings cultural education and storytelling resources to schools, families, and community groups.",
    offer: "AfriGrow member resources",
    ctaLabel: "Learn more",
    ctaHref: "/contact",
    logoSrc: "/partners/loadofs.png",
    verified: true,
    cardTheme: "from-[#1a3a2f] via-primary-dark to-primary",
  },
  {
    id: "yaf",
    name: "Yoruba Awareness Foundation",
    category: "Community & heritage",
    headline: "Preserving Yoruba language, culture, and identity",
    description:
      "YAF supports awareness programmes that keep language and tradition alive for the next generation.",
    offer: "Community partnership",
    ctaLabel: "Get in touch",
    ctaHref: "/contact",
    logoSrc: "/partners/yaf.png",
    verified: true,
    cardTheme: "from-slate-100 via-white to-slate-50",
  },
  {
    id: "funability",
    name: "Funability Project",
    category: "Events & inclusion",
    headline: "Inclusive events and experiences for every ability",
    description:
      "Funability delivers accessible event planning and projection services for schools, charities, and community groups.",
    offer: "Member event support",
    ctaLabel: "Request info",
    ctaHref: "/contact",
    logoSrc: "/partners/funability.png",
    verified: true,
    cardTheme: "from-sky-600 via-blue-700 to-indigo-800",
  },
  {
    id: "edventurous",
    name: "Edventurous",
    category: "Education & events",
    headline: "Engaging learning experiences that inspire young minds",
    description:
      "Edventurous creates educational events and programmes designed to spark curiosity and confidence in learners.",
    offer: "Partner programmes",
    ctaLabel: "Learn more",
    ctaHref: "/contact",
    logoSrc: "/partners/edventurous.png",
    verified: true,
    cardTheme: "from-[#0f2744] via-[#163a5f] to-[#1e4d7b]",
  },
  {
    id: "canuk",
    name: "CANUK — Central Association of Nigerians in the United Kingdom",
    category: "Diaspora & community",
    headline: "Unifying, protecting, and empowering Nigerians in the UK",
    description:
      "CANUK is the national umbrella body for Nigerian community associations across the United Kingdom — connecting diaspora networks, culture, and opportunity.",
    offer: "Community partnership",
    ctaLabel: "Visit website",
    ctaHref: "https://www.canukonline.com/",
    logoSrc: "/partners/canuk.png",
    verified: true,
    cardTheme: "from-[#0a3d2a] via-[#145c3a] to-[#1a7a4c]",
  },
  {
    id: "afrigrow",
    name: "AfriGrow Hub",
    category: "Platform",
    headline: "Your AI-powered home for business growth",
    description:
      "Profiles, marketing, matching, funding tools, and CRM — built for African SMEs on one platform.",
    offer: "Early access — free to start",
    ctaLabel: "Join free",
    ctaHref: "/signup",
    logoSrc: "/partners/afrigrow.png",
    verified: true,
    cardTheme: "from-primary-dark via-primary to-[#117a55]",
  },
  {
    id: "sage",
    name: "Sage Accounting Africa",
    category: "Finance & accounting",
    headline: "Cloud accounting built for growing businesses",
    description:
      "Track invoices, expenses, and cash flow with tools designed for African SMEs.",
    offer: "Exclusive member trial",
    ctaLabel: "Coming soon",
    verified: true,
    cardTheme: "from-emerald-600 via-emerald-700 to-emerald-900",
  },
  {
    id: "canva",
    name: "Canva for Business",
    category: "Design & marketing",
    headline: "Professional posts, flyers, and brand assets in minutes",
    description:
      "Create social content and promotional designs without a design team.",
    offer: "Member templates",
    ctaLabel: "Coming soon",
    verified: true,
    cardTheme: "from-cyan-500 via-sky-600 to-blue-700",
  },
  {
    id: "payflow",
    name: "PayFlow Africa",
    category: "Payments & fintech",
    headline: "Accept mobile money, cards, and invoices",
    description:
      "SME-friendly payment tools so you get paid faster across African markets.",
    offer: "Preferential rates",
    ctaLabel: "Coming soon",
    verified: true,
    cardTheme: "from-violet-600 via-purple-700 to-indigo-900",
  },
  {
    id: "courierit",
    name: "CourierIT",
    category: "Logistics",
    headline: "Affordable delivery for sellers and retailers",
    description:
      "Discounted courier rates for marketplace sellers shipping across regions.",
    offer: "Member discounts",
    ctaLabel: "Coming soon",
    verified: true,
    cardTheme: "from-orange-500 via-amber-600 to-orange-700",
  },
  {
    id: "ceo-academy",
    name: "CEO Academy",
    category: "Training & compliance",
    headline: "HR, labour law, and compliance training for growing teams",
    description:
      "Complimentary training sessions to help you hire and manage staff with confidence.",
    offer: "Free member sessions",
    ctaLabel: "Coming soon",
    verified: true,
    cardTheme: "from-blue-700 via-blue-800 to-slate-900",
  },
  {
    id: "momentum",
    name: "Momentum SME Insure",
    category: "Insurance",
    headline: "Business cover tailored for African small businesses",
    description:
      "Protect your stock, equipment, and team with flexible SME insurance options.",
    ctaLabel: "Coming soon",
    verified: false,
    cardTheme: "from-rose-600 via-red-700 to-rose-900",
  },
];
