import { BrandLogo } from "@/components/BrandLogo";

type AuthLogoProps = {
  variant?: "default" | "light";
};

export function AuthLogo({ variant = "default" }: AuthLogoProps) {
  return (
    <BrandLogo
      size="lg"
      className={
        variant === "light"
          ? "rounded-2xl bg-white/95 p-2 shadow-sm"
          : "rounded-2xl bg-white p-1.5 shadow-sm shadow-primary/5"
      }
    />
  );
}
