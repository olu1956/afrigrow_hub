import { AgentPlaceholder } from "@/components/dashboard/AgentPlaceholder";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { allNavItems } from "@/lib/dashboard-nav";

function getNavItem(href: string) {
  const item = allNavItems.find((n) => n.href === href);
  if (!item) throw new Error(`Unknown nav item: ${href}`);
  return item;
}

export function createAgentPage(href: string) {
  const item = getNavItem(href);
  return function AgentPage() {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title={item.label} description={item.description} />
        <AgentPlaceholder item={item} />
      </div>
    );
  };
}
