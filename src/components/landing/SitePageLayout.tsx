import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";

type SitePageLayoutProps = {
  children: React.ReactNode;
};

export function SitePageLayout({ children }: SitePageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
