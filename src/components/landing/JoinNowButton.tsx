import Link from "next/link";

type JoinNowButtonProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
};

const sizeClasses = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export function JoinNowButton({
  size = "md",
  className = "",
  href = "/join",
}: JoinNowButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-md bg-accent font-bold uppercase tracking-wide text-white shadow-md shadow-accent/25 transition hover:bg-accent/90 ${sizeClasses[size]} ${className}`}
    >
      Join now
    </Link>
  );
}
