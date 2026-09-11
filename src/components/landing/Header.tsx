"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function Header() {
  const router = useRouter();
  const { signOut } = useSession();
  const { isAuthenticated: loggedIn } = useAuthenticatedUser();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-primary-light/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo size="md" />

          <div className="flex shrink-0 items-center gap-3">
            {loggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-base font-medium text-muted transition hover:text-foreground sm:text-lg"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-base font-medium text-muted transition hover:text-foreground sm:text-lg"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-base font-medium text-muted transition hover:text-foreground sm:text-lg"
                >
                  Log in
                </Link>
                <JoinNowButton size="lg" />
              </>
            )}
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-primary/10 pt-2 text-base font-medium text-muted sm:gap-x-7 sm:text-lg">
          <NavDropdown label="Initiatives" items={[...initiativeLinks]} />
          {homeSectionLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-primary">
              {link.label}
            </Link>
          ))}
          <Link href="/demo" className="transition hover:text-primary">
            Demo
          </Link>
          <NavDropdown label="Partners" items={partnerLinks} />
        </nav>
      </div>
    </header>
  );
}
