import Link from "next/link";
import { BetterAuthLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SpecReader } from "@/components/spec/spec-reader";
import { getSpecContent } from "@/lib/spec";

export const metadata = {
	title: "Specification — Agent Auth Protocol",
	description:
		"An implementation-oriented protocol for AI agent identity, registration, and capability access.",
};

export default function SpecificationPage() {
	const { content, toc } = getSpecContent();

	return (
		<div className="h-dvh flex flex-col">
			<nav className="shrink-0 flex items-center border-b border-foreground/8">
				<Link
					href="/"
					className="flex items-center gap-1 px-5 sm:px-6 py-3"
				>
					<BetterAuthLogo className="h-4 w-4" />
					<p className="select-none font-mono text-sm uppercase">
						BETTER-AUTH.
					</p>
				</Link>
				<div className="ml-auto flex items-center px-5 sm:px-6">
					<ThemeToggle />
				</div>
			</nav>
			<SpecReader content={content} toc={toc} />
		</div>
	);
}
