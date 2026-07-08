"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { JoinNowButton } from "@/components/landing/JoinNowButton";
import { NavDropdown } from "@/components/landing/NavDropdown";
import { useSession } from "@/components/providers/SessionProvider";
import { useAuthenticatedUser } from "@/lib/use-authenticated-user";
import { initiativeLinks } from "@/lib/initiatives-nav";
import { homeSectionLinks } from "@/lib/home-nav";

const partnerLinks = [
  { href: "/partners", label: "Our Partners" },
  { href: "/partners/programme", label: "Partner Programme" },
  { href: "/partners/become-a-partner", label: "Become a Partner" },
];

function MobileNavGroup({
  label,
  items,
  open,
  onToggle,
  onNavigate,
}: {
  label: string;
  items: { href: string; label: string }[];
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-lg font-medium text-foreground transition hover:bg-white/60 hover:text-primary"
        aria-expanded={open}
      >
        {label}
        <span className="text-xs text-muted">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <ul className="ml-3 mt-1 space-y-0.5 border-l-2 border-primary/20 pl-3">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className="block rounded-lg px-3 py-2.5 text-lg text-muted transition hover:bg-white/60 hover:text-primary"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Header() {
  const router = useRouter();
  const { signOut } = useSession();
  const { isAuthenticated: loggedIn } = useAuthenticatedUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileInitiativesOpen, setMobileInitiativesOpen] = useState(false);
  const [mobilePartnersOpen, setMobilePartnersOpen] = useState(false);

  async function handleSignOut() {
    closeMobileMenu();
    await signOut();
    router.push("/");
    router.refresh();
  }

  function closeMobileMenu() {
    setMenuOpen(false);
    setMobileInitiativesOpen(false);
    setMobilePartnersOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-primary-light/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-[5.5rem] max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <BrandLogo size="md" />

        <nav className="hidden items-center gap-7 text-lg font-medium text-muted lg:gap-9 lg:flex">
          <NavDropdown label="Initiatives" items={[...initiativeLinks]} />
          {homeSectionLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <NavDropdown label="Partners" items={partnerLinks} />
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {loggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="hidden text-lg font-medium text-muted transition hover:text-foreground sm:inline"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="hidden text-lg font-medium text-muted transition hover:text-foreground sm:inline"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-lg font-medium text-muted transition hover:text-foreground sm:inline"
              >
                Log in
              </Link>
              <JoinNowButton size="lg" />
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-muted transition hover:bg-white/60 hover:text-foreground lg:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-primary/10 bg-primary-light lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            <MobileNavGroup
              label="Initiatives"
              items={[...initiativeLinks]}
              open={mobileInitiativesOpen}
              onToggle={() => setMobileInitiativesOpen((o) => !o)}
              onNavigate={closeMobileMenu}
            />

            {homeSectionLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-3 text-lg font-medium text-foreground transition hover:bg-white/60 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}

            <MobileNavGroup
              label="Partners"
              items={partnerLinks}
              open={mobilePartnersOpen}
              onToggle={() => setMobilePartnersOpen((o) => !o)}
              onNavigate={closeMobileMenu}
            />

            <div className="mt-2 flex flex-col gap-2 border-t border-primary/10 pt-3">
              {loggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className="rounded-lg px-3 py-3 text-center text-lg font-medium text-primary transition hover:bg-white/60"
                  >
                    Go to dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-lg px-3 py-3 text-center text-lg font-medium text-muted transition hover:bg-white/60 hover:text-foreground"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="rounded-lg px-3 py-3 text-center text-lg font-medium text-muted transition hover:bg-white/60 hover:text-foreground"
                  >
                    Log in
                  </Link>
                  <JoinNowButton size="md" className="w-full" href="/join" />
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
