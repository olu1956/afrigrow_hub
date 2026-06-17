import type { Metadata } from "next";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";

export const metadata: Metadata = {
  title: "Settings — AfriGrow Hub",
};

export default function SettingsPage() {
  return <SettingsPanel />;
}
