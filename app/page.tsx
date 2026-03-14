import Link from "next/link";
import { LandingShell } from "@/components/landing/landing-shell";
import { BetterAuthLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function LandingPage() {
	return (
		<div className="h-dvh flex flex-col relative">
			<nav className="shrink-0 flex items-center absolute top-0 left-0 right-0 z-10">
				<Link href="/" className="flex items-center gap-1 px-4 sm:px-4 py-3">
					<BetterAuthLogo className="h-4 w-4" />
					<p className="select-none font-mono text-sm uppercase">
						BETTER-AUTH.
					</p>
				</Link>
				<div className="ml-auto flex items-center px-4">
					<ThemeToggle />
				</div>
			</nav>
			<LandingShell />
		</div>
	);
}
