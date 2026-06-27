export const BRAND_LOGO_PATH = "/afrigrow-logo.png";
export const BRAND_LOGO_ALT = "AfriGrow Hub — Connect. Grow. Automate. Succeed.";

export const brandLogoSizes = {
  sm: "h-12 w-auto",
  md: "h-20 w-auto",
  lg: "h-28 w-auto sm:h-32",
  xl: "h-36 w-auto sm:h-40",
} as const;

export type BrandLogoSize = keyof typeof brandLogoSizes;
