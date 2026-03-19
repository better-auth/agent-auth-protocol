"use client";
import { motion } from "motion/react";
import { BookIcon, DocumentIcon } from "@/components/icons";
import { GlobeIcon, PlayIcon, ReaderIcon } from "@radix-ui/react-icons";

export function LandingHero() {
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
					Agent Auth <span className="text-foreground/80">Protocol</span>
				</motion.h1>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
					data-hero-fade
					className="text-[15px] sm:text-base text-foreground/80 max-w-lg mx-auto leading-[1.8] tracking-normal"
					style={{ fontFamily: "var(--font-content), Georgia, serif" }}
				>
					The open-source protocol and implementation for AI agent
					authentication, capability-based authorization, and service
					discovery.
				</motion.p>

			

				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.18, ease: "easeOut" }}
					data-hero-fade
					className="pt-1 flex flex-wrap items-center justify-center gap-4 sm:gap-5 pointer-events-auto"
				>
					<a
						href="/docs"
						className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors"
					>
						<ReaderIcon className="w-3.5 h-3.5" />
						Docs
					</a>
					<span className="text-foreground/20 select-none font-light">
						/
					</span>
					<a
						href="/specification"
						className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors"
					>
						<DocumentIcon className="w-3.5 h-3.5" />
						Spec
					</a>
					<span className="text-foreground/20 select-none font-light">
						/
					</span>
					<a
						href="/directory"
						className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-foreground/50 hover:text-foreground transition-colors"
					>
						<GlobeIcon className="w-3.5 h-3.5" />
						Directory
					</a>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.12, ease: "easeOut" }}
					data-hero-fade
					className="pt-3 sm:pt-4 flex items-center justify-center pointer-events-auto"
				>
					<a
						href="/demo"
						className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-mono uppercase tracking-wider transition-colors"
					>
						<PlayIcon className="w-3.5 h-3.5 fill-current" />
						Try Demo
					</a>
				</motion.div>
			</div>
		</div>
	);
}
