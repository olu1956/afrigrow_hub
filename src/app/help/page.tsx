import type { Metadata } from "next";
import { HelpChat } from "@/components/assistant/HelpChat";
import { SitePageLayout } from "@/components/landing/SitePageLayout";
import { assistantConfig } from "@/lib/assistant/config";

export const metadata: Metadata = {
  title: "Ask AfriGrow",
  description:
    "Ask general questions about AfriGrow Hub. The assistant uses published pages and does not give legal, tax, or funding decisions.",
};

export default function HelpPage() {
  const config = assistantConfig();

  return (
    <SitePageLayout>
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <HelpChat
          privacyHref={config.privacyHref}
          supportHref={config.supportHref}
          providerConfigured={config.providerConfigured}
        />
      </section>
    </SitePageLayout>
  );
}
