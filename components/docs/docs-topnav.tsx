"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { GitHubIcon, WordmarkLogo } from "@/components/icons";
import { SidebarContent } from "@/components/docs/docs-sidebar";
import type { DocsSection } from "@/lib/docs";
import { Menu, X, ChevronRight } from "lucide-react";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

const TABS = [
	{ label: "Docs", href: "/docs", match: "/docs" },
	{ label: "Specification", href: "/specification/v1.0-draft", match: "/specification" },
	{ label: "Directory", href: "/directory", match: "/directory" },
	{ label: "Demo", href: "/demo", match: "/demo" },
];

const SIDEBAR_WIDTH = 280;

export function DocsTopNav({ sections }: { sections?: DocsSection[] }) {
	const pathname = usePathname();
	const isDocsPath = pathname.startsWith("/docs");
	const hasSidebar = isDocsPath && sections && sections.length > 0;
	const [mobileOpen, setMobileOpen] = useState(false);
	const [mobileView, setMobileView] = useState<"menu" | "sidebar">("menu");

	useEffect(() => {
		if (mobileOpen) {
			setMobileView(hasSidebar ? "sidebar" : "menu");
		}
	}, [mobileOpen, hasSidebar]);

	useEffect(() => {
		setMobileOpen(false);
	}, [pathname]);

	const currentPage = hasSidebar
		? sections.flatMap((s) => s.items).find((item) => pathname === item.href)
		: undefined;

	return (
		<div className="border-b border-fd-border">
			{/* Mobile bar — unified for all pages */}
			<div className="flex items-center gap-3 px-4 h-11 lg:hidden">
				<button
					type="button"
					onClick={() => setMobileOpen((v) => !v)}
					className="flex size-7 items-center justify-center border border-fd-border text-fd-foreground/70 hover:bg-fd-accent transition-colors cursor-pointer"
				>
					{mobileOpen ? <X className="size-3.5" /> : <Menu className="size-3.5" />}
				</button>
				<Link href="/" className="select-none">
					<WordmarkLogo className="h-4 w-auto" />
				</Link>
				{currentPage && (
					<>
						<ChevronRight className="size-3 text-fd-muted-foreground/50 shrink-0" />
						<span className="text-sm text-fd-foreground truncate">
							{currentPage.title}
						</span>
					</>
				)}
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
			</div>

			{/* Desktop bar */}
			<div className="hidden lg:flex items-center">
				<Link
					href="/"
					className="shrink-0 px-4 h-11 items-center select-none inline-flex w-[280px]"
				>
					<WordmarkLogo className="h-4 w-auto" />
				</Link>
				<div className="flex-1" />
				<nav className="flex items-center">
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
				<div className="px-4 flex items-center gap-1">
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

			{/* Mobile slide-out panel */}
			<MobileMenuOverlay
				open={mobileOpen}
				onClose={() => setMobileOpen(false)}
				view={mobileView}
				onViewChange={setMobileView}
				sections={sections}
				pathname={pathname}
				hasSidebar={!!hasSidebar}
			/>
		</div>
	);
}

function MobileMenuOverlay({
	open,
	onClose,
	view,
	onViewChange,
	sections,
	pathname,
	hasSidebar,
}: {
	open: boolean;
	onClose: () => void;
	view: "menu" | "sidebar";
	onViewChange: (v: "menu" | "sidebar") => void;
	sections?: DocsSection[];
	pathname: string;
	hasSidebar: boolean;
}) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-40 bg-fd-background/60 backdrop-blur-sm lg:hidden"
						onClick={onClose}
					/>
					<motion.div
						initial={{ x: -SIDEBAR_WIDTH }}
						animate={{ x: 0 }}
						exit={{ x: -SIDEBAR_WIDTH }}
						transition={{ duration: 0.25, ease: "easeOut" }}
						className="fixed inset-y-0 left-0 z-50 lg:hidden"
					>
						{view === "sidebar" && hasSidebar && sections ? (
							<SidebarContent
								sections={sections}
								pathname={pathname}
								onNavigate={onClose}
								headerSlot={
									<button
										type="button"
										onClick={() => onViewChange("menu")}
										className="shrink-0 flex items-center gap-2 px-4 h-11 w-full border-b border-fd-border text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent/50 transition-colors cursor-pointer"
									>
										<ArrowLeftIcon className="size-3.5" />
										<span className="text-xs uppercase tracking-widest">Menu</span>
									</button>
								}
							/>
						) : (
							<div
								className="flex h-full flex-col border-r border-fd-border bg-fd-card"
								style={{ width: SIDEBAR_WIDTH }}
							>
								<div className="shrink-0 px-4 h-11 flex items-center border-b border-fd-border">
									<Link href="/" onClick={onClose} className="select-none">
										<WordmarkLogo className="h-4 w-auto" />
									</Link>
								</div>
								<nav className="flex flex-col py-2">
									{TABS.map((tab) => {
										const active = pathname.startsWith(tab.match);
										return (
											<Link
												key={tab.href}
												href={tab.href}
												onClick={onClose}
												className={cn(
													"px-4 py-2.5 text-[13px] uppercase tracking-widest transition-colors",
													active
														? "text-fd-foreground bg-fd-primary/8"
														: "text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent/50",
												)}
											>
												{tab.label}
											</Link>
										);
									})}
								</nav>
								{hasSidebar && (
									<button
										type="button"
										onClick={() => onViewChange("sidebar")}
										className="mx-4 mt-1 flex items-center gap-2 px-3 py-2.5 border border-fd-border text-[12px] text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent/50 transition-colors cursor-pointer"
									>
										<span className="flex-1 text-left uppercase tracking-widest">Docs Navigation</span>
										<ChevronRight className="size-3" />
									</button>
								)}
							</div>
						)}
					</motion.div>
				</>
			)}
		</AnimatePresence>,
		document.body,
	);
}
