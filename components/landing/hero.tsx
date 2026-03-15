"use client";

import { Check, Copy, Globe } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import {
	BookIcon,
	ChevronRightIcon,
	DocumentIcon,
} from "@/components/icons";

export function LandingHero() {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText("npx auth ai");
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="relative w-full flex flex-col items-center text-center pointer-events-none z-10">
			<div className="space-y-3 sm:space-y-4">
			<motion.h1
				initial={{ opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.25, delay: 0.08, ease: "easeOut" }}
				className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-foreground leading-[1.1] tracking-[-0.02em]"
				style={{ fontFamily: "var(--font-display), serif" }}
			>
				Agent Auth
			</motion.h1>

			<motion.p
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
				data-hero-fade
				className="text-[15px] sm:text-base text-foreground/45 max-w-lg mx-auto leading-[1.8] tracking-normal"
				style={{ fontFamily: "var(--font-content), Georgia, serif" }}
			>
				The open-source protocol and implementation for AI agent authentication, capability-based authorization, and service discovery.
			</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.12, ease: "easeOut" }}
					data-hero-fade
					className="pt-3 sm:pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-5 pointer-events-auto"
				>
					<a
						href="/docs"
						className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors"
					>
						<BookIcon className="w-3.5 h-3.5" />
						Docs
					</a>
					<span className="text-foreground/20 select-none font-light">/</span>
					<a
						href="/specification"
						className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors"
					>
						<DocumentIcon className="w-3.5 h-3.5" />
						Protocol
					</a>
					<span className="text-foreground/20 select-none font-light">/</span>
					<a
						href="/registry"
						className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors"
					>
						<Globe className="w-3.5 h-3.5" />
						Registry
					</a>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.18, ease: "easeOut" }}
					data-hero-fade
					className="pt-2 sm:pt-3"
				>
					<button
						onClick={handleCopy}
						type="button"
						className="pointer-events-auto group inline-flex items-center gap-0 border border-foreground/10 transition-all cursor-pointer overflow-hidden"
					>
						<span className="flex items-center gap-1.5 bg-foreground/6 px-3 py-1.5 border-r border-foreground/10">
							<ChevronRightIcon className="w-3 h-3 text-foreground/30" />
							<code className="text-[11px] sm:text-xs font-mono text-foreground/55 group-hover:text-foreground/80 transition-colors">
								npx auth ai
							</code>
						</span>
						<span className="flex items-center px-2.5 py-1.5 bg-foreground/3 hover:bg-foreground/6 transition-colors">
							{copied ? (
								<Check className="h-3 w-3 text-emerald-500" />
							) : (
								<Copy className="h-3 w-3 text-foreground/30 group-hover:text-foreground/50 transition-colors" />
							)}
						</span>
					</button>
				</motion.div>
			</div>
		</div>
	);
}
