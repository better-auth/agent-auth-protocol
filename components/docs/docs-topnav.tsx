"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { GitHubIcon, WordmarkLogo } from "@/components/icons";
import { HamburgerMenuIcon, Cross2Icon } from "@radix-ui/react-icons";

const TABS = [
	{ label: "Docs", href: "/docs", match: "/docs" },
	{ label: "Specification", href: "/specification/v1.0-draft", match: "/specification" },
	{ label: "Directory", href: "/directory", match: "/directory" },
	{ label: "Demo", href: "/demo", match: "/demo" },
];

export function DocsTopNav() {
	const pathname = usePathname();
	const isDocsPath = pathname.startsWith("/docs");
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<div className="border-b border-fd-border relative">
			{!isDocsPath && (
				<div className="flex items-center border-b border-fd-border lg:border-b-0 lg:hidden">
					<Link
						href="/"
						className="px-4 h-11 inline-flex items-center select-none"
					>
						<WordmarkLogo className="h-4 w-auto" />
					</Link>
					<div className="ml-auto px-4 flex items-center gap-1">
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
				</div>
			)}
			<div className="flex items-center">
				<Link
					href="/"
					className="shrink-0 px-4 h-11 items-center select-none hidden lg:inline-flex w-[280px]"
				>
					<WordmarkLogo className="h-4 w-auto" />
				</Link>
				<div className="flex-1" />

				{/* Desktop tabs */}
				<nav className="hidden lg:flex items-center">
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

				{/* Mobile hamburger */}
				<button
					type="button"
					onClick={() => setMenuOpen(!menuOpen)}
					className="lg:hidden px-4 h-11 inline-flex items-center justify-center text-fd-muted-foreground hover:text-fd-foreground transition-colors cursor-pointer"
				>
					{menuOpen ? <Cross2Icon className="size-4" /> : <HamburgerMenuIcon className="size-4" />}
				</button>

				<div className="px-4 hidden lg:flex items-center gap-1">
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
			</div>

			{/* Mobile dropdown */}
			{menuOpen && (
				<div className="lg:hidden border-t border-fd-border bg-fd-background">
					<nav className="flex flex-col py-1">
						{TABS.map((tab) => {
							const active = pathname.startsWith(tab.match);
							return (
								<Link
									key={tab.href}
									href={tab.href}
									onClick={() => setMenuOpen(false)}
									className={cn(
										"px-5 py-2.5 text-xs uppercase tracking-widest transition-colors",
										active
											? "text-fd-foreground bg-fd-muted/50"
											: "text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-muted/30",
									)}
								>
									{tab.label}
								</Link>
							);
						})}
					</nav>
					{isDocsPath && (
						<div className="flex items-center gap-1 px-4 py-2 border-t border-fd-border">
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
					)}
				</div>
			)}
		</div>
	);
}
