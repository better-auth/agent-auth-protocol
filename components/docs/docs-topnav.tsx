"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const TABS = [
	{ label: "Docs", href: "/docs", match: "/docs" },
	{ label: "Specification", href: "/specification/v1.0-draft", match: "/specification" },
	{ label: "Registry", href: "/registry", match: "/registry" },
];

export function DocsTopNav() {
	const pathname = usePathname();
	const isDocsPath = pathname.startsWith("/docs");

	return (
		<div
			className={cn(
				"sticky z-30 bg-background",
				isDocsPath ? "top-0 max-lg:top-[41px]" : "top-0",
			)}
		>
			<div className="flex items-center">
				{!isDocsPath && (
					<Link
						href="/"
						className="px-5 py-2.5 select-none text-sm uppercase text-fd-foreground"
					>
						AGENT-AUTH.
					</Link>
				)}
				<nav className="flex items-center">
					{TABS.map((tab) => {
						const active = pathname.startsWith(tab.match);
						return (
							<Link
								key={tab.href}
								href={tab.href}
								className={cn(
									"relative px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors",
									active
										? "text-fd-foreground"
										: "text-fd-muted-foreground hover:text-fd-foreground",
								)}
							>
								{tab.label}
								{active && (
									<span className="absolute inset-x-0 bottom-0 h-px bg-fd-foreground" />
								)}
							</Link>
						);
					})}
				</nav>
				{!isDocsPath && (
					<div className="ml-auto px-4">
						<ThemeToggle />
					</div>
				)}
			</div>
		</div>
	);
}
