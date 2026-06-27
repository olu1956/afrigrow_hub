import Image from "next/image";
import Link from "next/link";
import {
  BRAND_LOGO_ALT,
  BRAND_LOGO_PATH,
  brandLogoSizes,
  type BrandLogoSize,
} from "@/lib/brand-logo";

type BrandLogoProps = {
  href?: string;
  className?: string;
  onClick?: () => void;
  size?: BrandLogoSize;
};

export function BrandLogo({
  href = "/",
  className = "",
  onClick,
  size = "md",
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center transition hover:opacity-90 ${className}`}
      aria-label="AfriGrow Hub home"
    >
      <Image
        src={BRAND_LOGO_PATH}
        alt={BRAND_LOGO_ALT}
        width={1024}
        height={1024}
        priority
        className={`${brandLogoSizes[size]} object-contain`}
      />
    </Link>
  );
}
