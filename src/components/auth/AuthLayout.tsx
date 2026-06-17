import { AuthLogo } from "./AuthLogo";
import { CheckCircle2 } from "lucide-react";

const highlights = [
  "AI agents for marketing, growth & CRM",
  "Match with buyers, suppliers & partners",
  "Funding readiness tools built in",
  "Built for African SMEs",
];

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
};

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[45%] overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative">
          <AuthLogo variant="light" />
        </div>

        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
            Grow smarter with AI agents built for your business
          </h2>
          <ul className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-white/90">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm leading-relaxed sm:text-base">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/60">
          Trusted by traders, retailers, manufacturers & service providers across
          Africa.
        </p>
      </aside>

      <main className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <AuthLogo />
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-muted">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
