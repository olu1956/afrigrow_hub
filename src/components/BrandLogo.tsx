import Link from "next/link";
import { Sprout } from "lucide-react";

type BrandLogoProps = {
  href?: string;
  className?: string;
  onClick?: () => void;
};

export function BrandLogo({ href = "/", className = "", onClick }: BrandLogoProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2.5 transition hover:opacity-90 ${className}`}
      aria-label="AfriGrow Hub home"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
        <Sprout className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">
        AfriGrow<span className="text-primary"> Hub</span>
      </span>
    </Link>
  );
}
