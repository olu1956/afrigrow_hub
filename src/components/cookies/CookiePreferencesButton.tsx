"use client";

type CookiePreferencesButtonProps = {
  className?: string;
  children: React.ReactNode;
};

export function CookiePreferencesButton({ className, children }: CookiePreferencesButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("afrigrow:cookie-preferences"))}
      className={className}
    >
      {children}
    </button>
  );
}
