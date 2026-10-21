import Link from "next/link";
import { MessagesSquare } from "lucide-react";

/** Floating entry to the help assistant. Shown as soon as the homepage loads. */
export function HomeHelpButton() {
  return (
    <Link
      href="/help"
      className="fixed bottom-4 right-4 z-[80] flex h-[4.75rem] w-[4.75rem] flex-col items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
    >
      <MessagesSquare className="h-6 w-6" aria-hidden />
      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide">Help</span>
    </Link>
  );
}
