import Link from "next/link";
import { LandingContent } from "@/components/landing/landing-content";
import { Logo, SlashIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function LandingPage() {
  return (
    <div className="h-dvh flex flex-col relative">
      <nav
        className="shrink-0 flex bg-background md:bg-transparent items-center absolute top-0 left-0 right-0 z-50 pb-6"
        style={{
          maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 60%, transparent 100%)",
        }}
      >
        <Link href="/" className="flex items-center gap-1 px-4 sm:px-4 py-3">
          <Logo className="h-4 w-4" />
          <p className="select-none text-sm uppercase">| AGENT-AUTH.</p>
        </Link>
        <div className="ml-auto flex items-center px-4">
          <ThemeToggle />
        </div>
      </nav>
      <LandingContent />
    </div>
  );
}
