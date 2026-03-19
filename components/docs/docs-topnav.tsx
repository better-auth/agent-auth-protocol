"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { WordmarkLogo } from "@/components/icons";

const TABS = [
	{ label: "Docs", href: "/docs", match: "/docs" },
	{ label: "Specification", href: "/specification/v1.0-draft", match: "/specification" },
	{ label: "Directory", href: "/directory", match: "/directory" },
	{ label: "Demo", href: "/demo", match: "/demo" },
];

export function DocsTopNav() {
	const pathname = usePathname();
	const isDocsPath = pathname.startsWith("/docs");

	return (
		<div className="border-b border-fd-border">
			{!isDocsPath && (
				<div className="flex items-center border-b border-fd-border lg:border-b-0 lg:hidden">
					<Link
						href="/"
						className="px-4 h-11 inline-flex items-center select-none"
					>
						<WordmarkLogo className="h-4 w-auto" />
					</Link>
					<div className="ml-auto px-4">
						<ThemeToggle />
					</div>
				</div>
			)}
			<div className="flex items-center">
				{!isDocsPath && (
					<Link
						href="/"
						className="px-4 h-11 items-center select-none hidden lg:inline-flex"
					>
						<WordmarkLogo className="h-4 w-auto" />
					</Link>
				)}
				<nav className="flex items-center overflow-x-auto no-scrollbar">
					{TABS.map((tab) => {
						const active = pathname.startsWith(tab.match);
						return (
							<Link
								key={tab.href}
								href={tab.href}
								className={cn(
									"relative px-5 h-11 inline-flex items-center text-xs uppercase tracking-widest transition-colors",
									active
										? "text-fd-foreground"
										: "text-fd-muted-foreground hover:text-fd-foreground",
								)}
							>
								{tab.label}
								{active && (
									<span className="absolute inset-x-0 bottom-0 h-px rounded-full bg-fd-foreground" />
								)}
							</Link>
						);
					})}
				</nav>
				{!isDocsPath && (
					<div className="ml-auto px-4 hidden lg:block">
						<ThemeToggle />
					</div>
				)}
			</div>
		</div>
	);
}
