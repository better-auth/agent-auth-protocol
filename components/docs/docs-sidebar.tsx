"use client";

import { motion } from "motion/react";
import {
	ArrowUpRight,
	BookOpenText,
	FileText,
	House,
	Library,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { DocsNavItem } from "@/lib/docs";

export function DocsSidebar({ navItems }: { navItems: DocsNavItem[] }) {
	const pathname = usePathname();

	return (
		<>
			<div className="sticky top-0 z-30 border-b border-foreground/8 bg-background/92 backdrop-blur lg:hidden">
				<div className="flex items-center gap-3 px-4 py-3">
					<Link href="/" className="flex min-w-0 items-center gap-2">
						<Logo className="h-4 w-4 shrink-0" />
						<div className="min-w-0">
							<p className="truncate text-[10px] font-mono uppercase tracking-[0.28em] text-foreground/45">
								Agent Auth
							</p>
							<p className="truncate text-sm text-foreground/85">Docs</p>
						</div>
					</Link>
					<div className="ml-auto">
						<ThemeToggle />
					</div>
				</div>
				<div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
					{navItems.map((item) => (
						<NavChip
							key={item.href}
							href={item.href}
							label={item.title}
							active={pathname === item.href}
						/>
					))}
					<NavChip
						href="/specification"
						label="Specification"
						active={pathname === "/specification"}
					/>
				</div>
			</div>

			<motion.aside
				initial={{ x: -20, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.28, ease: "easeOut" }}
				className="fixed inset-y-0 left-0 z-30 hidden w-[300px] flex-col border-r border-foreground/8 bg-background/94 backdrop-blur lg:flex"
			>
				<div className="border-b border-foreground/8 px-6 py-5">
					<div className="flex items-start justify-between gap-3">
						<Link href="/" className="flex min-w-0 items-center gap-2.5">
							<Logo className="h-4 w-4 shrink-0" />
							<div className="min-w-0">
								<p className="text-[10px] font-mono uppercase tracking-[0.28em] text-foreground/45">
									Agent Auth
								</p>
								<p className="truncate text-sm text-foreground/85">
									Documentation
								</p>
							</div>
						</Link>
						<ThemeToggle />
					</div>
				</div>

				<div className="flex-1 overflow-y-auto px-4 py-5">
					<div className="mb-6 px-2">
						<p className="text-[10px] font-mono uppercase tracking-[0.28em] text-foreground/40">
							Browse
						</p>
					</div>

					<nav className="space-y-1">
						{navItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								data-active={pathname === item.href || undefined}
								className={cn(
									"group block border border-transparent px-3 py-3 transition-colors",
									pathname === item.href
										? "border-foreground/10 bg-foreground/4.5"
										: "text-foreground/65 hover:border-foreground/8 hover:bg-foreground/3 hover:text-foreground",
								)}
							>
								<div className="flex items-start gap-3">
									<div
										className={cn(
											"mt-0.5 flex size-7 shrink-0 items-center justify-center border border-foreground/10 bg-foreground/[0.035] text-foreground/65 transition-colors",
											pathname === item.href &&
												"border-foreground/12 bg-foreground/6 text-foreground",
										)}
									>
										<FileText className="size-3.5" />
									</div>
									<div className="min-w-0">
										<p className="text-sm text-inherit">{item.title}</p>
										{item.description && (
											<p className="mt-1 line-clamp-2 text-xs leading-5 text-foreground/42 group-hover:text-foreground/55">
												{item.description}
											</p>
										)}
									</div>
								</div>
							</Link>
						))}
					</nav>

					<div className="my-6 h-px bg-foreground/8" />

					<div className="space-y-3 px-2">
						<div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-foreground/40">
							<Library className="size-3" />
							<span>Protocol</span>
						</div>
						<Link
							href="/specification"
							className="block border border-foreground/10 bg-foreground/3 p-4 text-foreground/72 transition-colors hover:bg-foreground/5 hover:text-foreground"
						>
							<div className="flex items-center gap-2 text-sm">
								<BookOpenText className="size-4" />
								<span>Open Specification</span>
								<ArrowUpRight className="ml-auto size-3.5 text-foreground/40" />
							</div>
							<p className="mt-2 text-xs leading-5 text-foreground/48">
								The full protocol draft lives in its own dedicated reading
								experience.
							</p>
						</Link>
					</div>
				</div>

				<div className="border-t border-foreground/8 px-6 py-4 text-[11px] text-foreground/42">
					<div className="flex items-center gap-2">
						<House className="size-3.5" />
						<Link href="/" className="hover:text-foreground transition-colors">
							Back to landing
						</Link>
					</div>
				</div>
			</motion.aside>
		</>
	);
}

function NavChip({
	href,
	label,
	active,
}: {
	href: string;
	label: string;
	active: boolean;
}) {
	return (
		<Link
			href={href}
			className={cn(
				"inline-flex shrink-0 items-center gap-1.5 border px-2.5 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors",
				active
					? "border-foreground/10 bg-foreground/6 text-foreground"
					: "border-foreground/8 text-foreground/55 hover:bg-foreground/4 hover:text-foreground",
			)}
		>
			<FileText className="size-3" />
			{label}
		</Link>
	);
}
