import Link from "next/link";
import { Sprout } from "lucide-react";

type AuthLogoProps = {
  variant?: "default" | "light";
};

export function AuthLogo({ variant = "default" }: AuthLogoProps) {
  const isLight = variant === "light";

  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          isLight ? "bg-white/15 text-white" : "bg-primary text-white"
        }`}
      >
        <Sprout className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <span
        className={`text-xl font-bold tracking-tight ${
          isLight ? "text-white" : "text-foreground"
        }`}
      >
        AfriGrow
        <span className={isLight ? "text-accent" : "text-primary"}> Hub</span>
      </span>
    </Link>
  );
}
