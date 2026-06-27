import { Footer } from "@/components/landing/Footer";
import { HashScroll } from "@/components/landing/HashScroll";
import { Header } from "@/components/landing/Header";

type SitePageLayoutProps = {
  children: React.ReactNode;
};

export function SitePageLayout({ children }: SitePageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <HashScroll />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
