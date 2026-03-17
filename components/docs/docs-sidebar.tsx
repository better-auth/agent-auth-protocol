"use client";

import { motion, AnimatePresence } from "motion/react";
import {
	ChevronRight,
	Menu,
	Search,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { DocsSection } from "@/lib/docs";
import { WordmarkLogo } from "@/components/icons";

const SIDEBAR_WIDTH = 280;



function phi(d: string) {
	return function PhIcon({ className }: { className?: string }) {
		return (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className={className}>
				<path d={d} />
			</svg>
		);
	};
}

const ITEM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
	"file-text": phi("M232 48h-64a32 32 0 0 0-32 32v87.73a8.17 8.17 0 0 1-7.47 8.25a8 8 0 0 1-8.53-8V80a32 32 0 0 0-32-32H24a8 8 0 0 0-8 8v144a8 8 0 0 0 8 8h72a24 24 0 0 1 24 23.94a7.9 7.9 0 0 0 5.12 7.55A8 8 0 0 0 136 232a24 24 0 0 1 24-24h72a8 8 0 0 0 8-8V56a8 8 0 0 0-8-8m-24 120h-39.73a8.17 8.17 0 0 1-8.25-7.47a8 8 0 0 1 8-8.53h39.73a8.17 8.17 0 0 1 8.25 7.47a8 8 0 0 1-8 8.53m0-32h-39.73a8.17 8.17 0 0 1-8.25-7.47a8 8 0 0 1 8-8.53h39.73a8.17 8.17 0 0 1 8.25 7.47a8 8 0 0 1-8 8.53m0-32h-39.73a8.17 8.17 0 0 1-8.27-7.47a8 8 0 0 1 8-8.53h39.73a8.17 8.17 0 0 1 8.27 7.47a8 8 0 0 1-8 8.53"),
	server: phi("M208 40H48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-28 52a12 12 0 1 1 12-12a12 12 0 0 1-12 12m28 44H48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-48a16 16 0 0 0-16-16m-28 52a12 12 0 1 1 12-12a12 12 0 0 1-12 12"),
	cable: ({ className }: { className?: string }) => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
			<path fill="currentColor" d="M9.9 2H8.1A2.6 2.6 0 0 0 8 3v18c-.032.337.002.676.1 1h1.8c.098-.324.132-.663.1-1V3a2.6 2.6 0 0 0-.1-1" opacity=".25" />
			<path fill="currentColor" d="M3 2h5v20H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1" />
			<path fill="currentColor" d="M10 2h11a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H10z" opacity=".5" />
		</svg>
	),
	bot: ({ className }: { className?: string }) => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
			<path d="M13.5 2c0 .444-.193.843-.5 1.118V5h5a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h5V3.118A1.5 1.5 0 1 1 13.5 2M0 10h2v6H0zm24 0h-2v6h2zM9 14.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m7.5-1.5a1.5 1.5 0 1 0-3 0a1.5 1.5 0 0 0 3 0" />
		</svg>
	),
	monitor: phi("M208 40H48a24 24 0 0 0-24 24v112a24 24 0 0 0 24 24h72v16H96a8 8 0 0 0 0 16h64a8 8 0 0 0 0-16h-24v-16h72a24 24 0 0 0 24-24V64a24 24 0 0 0-24-24m0 144H48a8 8 0 0 1-8-8v-16h176v16a8 8 0 0 1-8 8"),
	key: phi("M216.57 39.43a80 80 0 0 0-132.66 81.35L28.69 176A15.86 15.86 0 0 0 24 187.31V216a16 16 0 0 0 16 16h32a8 8 0 0 0 8-8v-16h16a8 8 0 0 0 8-8v-16h16a8 8 0 0 0 5.66-2.34l9.56-9.57A79.7 79.7 0 0 0 160 176h.1a80 80 0 0 0 56.47-136.57M180 92a16 16 0 1 1 16-16a16 16 0 0 1-16 16"),
	compass: phi("M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24m87.62 96h-39.83c-1.79-36.51-15.85-62.33-27.38-77.6a88.19 88.19 0 0 1 67.22 77.6ZM96.23 136h63.54c-2.31 41.61-22.23 67.11-31.77 77c-9.55-9.9-29.46-35.4-31.77-77m0-16c2.31-41.61 22.23-67.11 31.77-77c9.55 9.93 29.46 35.43 31.77 77Zm52.18 93.6c11.53-15.27 25.56-41.09 27.38-77.6h39.84a88.19 88.19 0 0 1-67.22 77.6"),
	wrench: phi("M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-91 94.25l-40 32a8 8 0 1 1-10-12.5L107.19 128L75 102.25a8 8 0 1 1 10-12.5l40 32a8 8 0 0 1 0 12.5M176 168h-40a8 8 0 0 1 0-16h40a8 8 0 0 1 0 16"),
	plug: phi("M165.78 224H208a16 16 0 0 0 16-16v-37.65a8 8 0 0 0-11.06-7.35a23.4 23.4 0 0 1-8.94 1.77c-13.23 0-24-11.1-24-24.73s10.77-24.73 24-24.73a23.4 23.4 0 0 1 8.94 1.77a8 8 0 0 0 11.06-7.43V72a16 16 0 0 0-16-16h-36.22a35 35 0 0 0 .22-4a36 36 0 0 0-72 0a35 35 0 0 0 .22 4H64a16 16 0 0 0-16 16v32.22a35 35 0 0 0-4-.22a36 36 0 0 0 0 72a35 35 0 0 0 4-.22V208a16 16 0 0 0 16 16h42.22"),
	package: phi("m223.68 66.15l-88-48.15a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03M128 120L47.65 76L128 32l80.35 44Zm8 99.64v-85.81l80-43.78v85.76Z"),
	shield: phi("M208 40H48a16 16 0 0 0-16 16v56c0 52.72 25.52 84.67 46.93 102.19c23.06 18.86 46 25.26 47 25.53a8 8 0 0 0 4.2 0c1-.27 23.91-6.67 47-25.53C198.48 196.67 224 164.72 224 112V56a16 16 0 0 0-16-16m-34.32 69.66l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32Z"),
};

function GitHubIcon({ className }: { className?: string }) {
	return (
		<svg fill="currentColor" viewBox="0 0 24 24" className={className}>
			<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
		</svg>
	);
}

function SearchTrigger() {
	const isMac = useMemo(() => {
		if (typeof navigator === "undefined") return true;
		return navigator.platform?.toLowerCase().includes("mac") ?? true;
	}, []);

	const openSearch = useCallback(() => {
		const event = new KeyboardEvent("keydown", {
			key: "k",
			metaKey: isMac,
			ctrlKey: !isMac,
			bubbles: true,
		});
		document.dispatchEvent(event);
	}, [isMac]);

	return (
		<button
			type="button"
			onClick={openSearch}
			className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-fd-muted-foreground border-y border-fd-border hover:bg-fd-accent/50 transition-colors"
		>
			<Search className="size-3.5 shrink-0" />
			<span className="flex-1 text-left">Search</span>
			<kbd className="text-[10px] font-mono text-fd-muted-foreground/60 border border-fd-border px-1.5 h-[22px] inline-flex items-center justify-center gap-1">
				{isMac ? (
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
						<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
					</svg>
				) : (
					<span>Ctrl</span>
				)}
				<span>K</span>
			</kbd>
		</button>
	);
}

export function DocsSidebar({ sections }: { sections: DocsSection[] }) {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);

	const currentPage = sections
		.flatMap((s) => s.items)
		.find((item) => pathname === item.href);

	return (
		<>
			{/* Mobile top bar */}
			<div className="sticky top-0 z-40 border-b border-fd-border bg-fd-background/95 backdrop-blur-sm lg:hidden">
				<div className="flex items-center gap-3 px-4 py-2.5">
					<button
						type="button"
						onClick={() => setMobileOpen((v) => !v)}
						className="flex size-7 items-center justify-center border border-fd-border text-fd-foreground/70 hover:bg-fd-accent transition-colors"
					>
						{mobileOpen ? (
							<X className="size-3.5" />
						) : (
							<Menu className="size-3.5" />
						)}
					</button>
				<Link href="/" className="select-none text-sm uppercase">
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
					<div className="ml-auto shrink-0">
						<ThemeToggle />
					</div>
				</div>
			</div>

			{/* Mobile overlay */}
			<AnimatePresence>
				{mobileOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 z-40 bg-fd-background/60 backdrop-blur-sm lg:hidden"
							onClick={() => setMobileOpen(false)}
						/>
						<motion.div
							initial={{ x: -SIDEBAR_WIDTH }}
							animate={{ x: 0 }}
							exit={{ x: -SIDEBAR_WIDTH }}
							transition={{ duration: 0.25, ease: "easeOut" }}
							className="fixed inset-y-0 left-0 z-50 lg:hidden"
						>
							<SidebarContent
								sections={sections}
								pathname={pathname}
								onNavigate={() => setMobileOpen(false)}
							/>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}

export function SidebarContent({
	sections,
	pathname,
	onNavigate,
}: {
	sections: DocsSection[];
	pathname: string;
	onNavigate?: () => void;
}) {
	return (
		<div
			className="flex h-full flex-col border-r border-fd-border bg-fd-card"
			style={{ width: SIDEBAR_WIDTH }}
		>
			{/* Header */}
			<div className="shrink-0 px-4 py-3">
				<Link
				href="/"
				className="inline-block select-none text-sm uppercase"
				onClick={onNavigate}
			>
				<WordmarkLogo className="h-4 w-auto" />
			</Link>
			</div>
			<SearchTrigger />

			{/* Sections */}
			<div className="flex-1 overflow-y-auto no-scrollbar">
				<nav>
					{sections.map((section) => (
						<div key={section.title} className="py-3">
							<p className="px-4 pb-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-fd-muted-foreground/50">
								{section.title}
							</p>
							<ul>
								{section.items.map((item) => {
									const active = pathname === item.href;
									const ItemIcon = ITEM_ICONS[item.icon];
									return (
										<li key={item.href}>
											<Link
												href={item.href}
												onClick={onNavigate}
												className={cn(
													"flex items-center gap-2.5 px-4 py-1.5 text-[13px] transition-colors duration-150",
													active
														? "bg-fd-primary/8 text-fd-foreground"
														: "text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent/50",
												)}
											>
												{ItemIcon && (
													<ItemIcon className="size-3.5 shrink-0 opacity-50" />
												)}
												{item.title}
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					))}

					</nav>
			</div>

			{/* Footer */}
			<div className="shrink-0 border-t border-fd-border px-4 py-2.5 flex items-center justify-between">
				<a
					href="https://github.com/better-auth/agent-auth-protocol"
					target="_blank"
					rel="noopener noreferrer"
					className="text-fd-muted-foreground hover:text-fd-foreground transition-colors"
				>
					<GitHubIcon className="size-4" />
				</a>
				<ThemeToggle />
			</div>
		</div>
	);
}
