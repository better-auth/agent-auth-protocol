"use client";

import { Check, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

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
				An open protocol for AI agent authentication, capability-based authorization, and service discovery.
			</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.12, ease: "easeOut" }}
					data-hero-fade
					className="pt-3 sm:pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-5 pointer-events-auto"
				>
					<a
						href="/specification"
						className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors"
					>
						<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></svg>
						Specification
					</a>
					<span className="text-foreground/20 select-none font-light">/</span>
					<a
						href="/docs"
						className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors"
					>
						<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7v14m-9-3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
						Docs
					</a>
					<span className="text-foreground/20 select-none font-light">/</span>
					<a
						href="/registry"
						className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors"
					>
						<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>
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
							<svg
								className="w-3 h-3 text-foreground/30"
								viewBox="0 0 16 16"
								fill="currentColor"
							>
								<path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />
							</svg>
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
