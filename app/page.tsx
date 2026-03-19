import Link from "next/link";
import { GitHubIcon, WordmarkLogo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { LandingContent } from "@/components/landing/landing-content";

export default async function LandingPage() {
  return (
    <div className="h-dvh flex flex-col relative">
      <header className="shrink-0 sticky top-0 z-50 flex items-center backdrop-blur-sm px-4 py-1">
        <Link href="/" className="flex items-center">
          <WordmarkLogo className="h-4 w-auto" />
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <a
            href="https://github.com/better-auth/agent-auth-protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md text-foreground/90 hover:text-foreground transition-colors"
          >
            <GitHubIcon className="size-4" />
          </a>
          <ThemeToggle />
        </div>
      </header>
      <LandingContent />
    </div>
  );
}
