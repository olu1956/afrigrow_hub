"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "outline";
};

export function AuthButton({
  children,
  loading,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: AuthButtonProps) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

  const styles =
    variant === "primary"
      ? "bg-primary text-white hover:bg-primary-dark shadow-sm shadow-primary/20"
      : "border border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary-light/30";

  return (
    <button
      type={props.type ?? "submit"}
      disabled={disabled || loading}
      className={`${base} ${styles} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
