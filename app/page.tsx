import Link from "next/link";
import { WordmarkLogo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { LandingContent } from "@/components/landing/landing-content";

export default async function LandingPage() {
  return (
    <div className="h-dvh flex flex-col relative">
      <header className="shrink-0 sticky top-0 z-50 flex items-center backdrop-blur-sm px-4 py-1">
        <Link href="/" className="flex items-center">
          <WordmarkLogo className="h-4 w-auto" />
        </Link>
        <div className="ml-auto flex items-center">
          <ThemeToggle />
        </div>
      </header>
      <LandingContent />
    </div>
  );
}
