import Link from "next/link";
import { Sprout } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-br from-primary-dark via-primary to-primary px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white">
                <Sprout className="h-4 w-4" />
              </span>
              <span className="font-bold text-white">
                AfriGrow<span className="text-accent"> Hub</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/75">
              AI-powered business growth, promotion, automation and connection
              for African SMEs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-white">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                <li>
                  <a href="#features" className="transition hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#agents" className="transition hover:text-white">
                    AI Agents
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="transition hover:text-white">
                    Pricing
                  </a>
                </li>
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
          © {new Date().getFullYear()} AfriGrow Hub. Phase 1 — UI/UX preview.
        </div>
      </div>
    </footer>
  );
}
