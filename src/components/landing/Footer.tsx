import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { homeSectionLinks } from "@/lib/home-nav";
import { initiativeLinks } from "@/lib/initiatives-nav";
import { EARLY_ACCESS_FOOTER } from "@/lib/product-messaging";

export function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-br from-primary-dark via-primary to-primary px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <BrandLogo
              size="md"
              className="rounded-xl bg-white/95 p-1.5"
            />
            <p className="mt-3 max-w-xs text-sm text-white/75">
              AI-powered business growth, promotion, automation and connection
              for African SMEs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-semibold text-white">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                {homeSectionLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Initiatives</p>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                {initiativeLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Company</p>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                <li>
                  <Link href="/about" className="transition hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="transition hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/partners" className="transition hover:text-white">
                    Our Partners
                  </Link>
                </li>
                <li>
                  <Link href="/partners/programme" className="transition hover:text-white">
                    Partner Programme
                  </Link>
                </li>
                <li>
                  <Link href="/partners/become-a-partner" className="transition hover:text-white">
                    Become a Partner
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="transition hover:text-white">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Account</p>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                <li>
                  <Link href="/join" className="transition hover:text-white">
                    Join now
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="transition hover:text-white">
                    Log in
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="transition hover:text-white">
                    Sign up
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-8 text-center text-sm text-white/60">
          © {new Date().getFullYear()} AfriGrow Hub. {EARLY_ACCESS_FOOTER}
        </div>
      </div>
    </footer>
  );
}
