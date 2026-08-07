export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
};

export type Business = {
  id: string;
  user_id: string;
  business_name: string;
  industry: string;
  country: string;
  city: string;
  description: string;
  products_services: string[];
  logo_url: string;
  website: string;
  whatsapp: string;
  email: string;
  social_links: SocialLinks;
  profile_score: number;
  is_verified: boolean;
  /** Admin moderation: when true, excluded from the public directory. */
  directory_hidden?: boolean;
  created_at: string;
  updated_at: string;
};

export type BusinessInsert = Pick<Business, "user_id" | "business_name"> &
  Partial<
    Pick<
      Business,
      | "industry"
      | "country"
      | "city"
      | "description"
      | "products_services"
      | "logo_url"
      | "website"
      | "whatsapp"
      | "email"
      | "social_links"
      | "profile_score"
      | "is_verified"
    >
  >;

export type BusinessUpdate = Partial<
  Pick<
    Business,
    | "business_name"
    | "industry"
    | "country"
    | "city"
    | "description"
    | "products_services"
    | "logo_url"
    | "website"
    | "whatsapp"
    | "email"
    | "social_links"
    | "profile_score"
    | "is_verified"
  >
>;

export const BUSINESSES_TABLE = "businesses" as const;

export const emptySocialLinks: SocialLinks = {
  instagram: "",
  facebook: "",
  linkedin: "",
  twitter: "",
  tiktok: "",
};
