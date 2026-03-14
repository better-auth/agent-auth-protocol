"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LandingDiagrams } from "@/components/landing/diagrams";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHero } from "@/components/landing/hero";
import { HeroIdentityBg } from "@/components/landing/hero-identity";
import { HalftoneBackground } from "@/components/ui/halftone-background";
import { BetterAuthLogo } from "../logo";
import { ThemeToggle } from "../theme-toggle";

export function LandingShell() {
	const scrollRef = useRef<HTMLDivElement>(null);
	const heroInnerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const scrollEl = scrollRef.current;
		const innerEl = heroInnerRef.current;
		if (!scrollEl || !innerEl) return;

		const faders = Array.from(
			innerEl.querySelectorAll("[data-hero-fade]"),
		) as HTMLElement[];

		let prevT = -1;
		const PARALLAX_PX = 200;

		const onScroll = () => {
			const scrollTop = scrollEl.scrollTop;
			const t = Math.min(scrollTop / PARALLAX_PX, 1);

			if (Math.abs(t - prevT) < 0.001) return;
			prevT = t;

			const yOffset = scrollTop * 0.35;
			const scale = 1 - t * 0.04;
			const opacity = 1 - t * 0.7;

			innerEl.style.transform = `translateY(${yOffset}px) scale(${scale})`;
			innerEl.style.opacity = String(Math.max(opacity, 0));

			const fadeT = Math.min(t * 2.5, 1);
			for (const el of faders) {
				el.style.opacity = String(1 - fadeT);
			}
		};

		scrollEl.addEventListener("scroll", onScroll, { passive: true });
		return () => scrollEl.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<div ref={scrollRef} className="relative flex-1 overflow-y-auto min-h-0">
			{/* Hero */}
			<div className="relative overflow-hidden py-10 sm:py-14 lg:py-20">
				<HalftoneBackground />
				<HeroIdentityBg />

				{/* Grid overlay */}
				<div
					className="absolute inset-0 z-1 pointer-events-none select-none"
					aria-hidden="true"
					style={{
						backgroundImage: `
							linear-gradient(to right, var(--foreground) 1px, transparent 1px),
							linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)
						`,
						backgroundSize: "60px 60px",
						opacity: 0.04,
						maskImage:
							"radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%)",
						WebkitMaskImage:
							"radial-gradient(ellipse 70% 60% at 50% 50%, black 20%, transparent 70%)",
					}}
				/>

				{/* Scan lines */}
				<div
					className="absolute inset-0 z-1 pointer-events-none select-none"
					aria-hidden="true"
					style={{
						background:
							"linear-gradient(to bottom, transparent 0%, var(--foreground) 50%, transparent 100%)",
						backgroundSize: "100% 3px",
						backgroundRepeat: "repeat",
						opacity: 0.015,
					}}
				/>

				{/* Glow orbs */}
				<div
					className="absolute -top-20 -right-20 w-[400px] h-[400px] z-1 pointer-events-none select-none rounded-full"
					aria-hidden="true"
					style={{
						background:
							"radial-gradient(circle, var(--foreground) 0%, transparent 70%)",
						opacity: 0.035,
						filter: "blur(60px)",
					}}
				/>
				<div
					className="absolute -bottom-32 -left-32 w-[500px] h-[500px] z-1 pointer-events-none select-none rounded-full"
					aria-hidden="true"
					style={{
						background:
							"radial-gradient(circle, var(--foreground) 0%, transparent 70%)",
						opacity: 0.03,
						filter: "blur(80px)",
					}}
				/>

				{/* Corner marks */}
				<div
					className="absolute inset-0 z-1 pointer-events-none select-none overflow-hidden"
					aria-hidden="true"
				>
					
					<svg
						className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-foreground/25"
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
					>
						<path d="M0 12V20H8" stroke="currentColor" strokeWidth="1" />
					</svg>
					<svg
						className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-foreground/25"
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
					>
						<path d="M20 12V20H12" stroke="currentColor" strokeWidth="1" />
					</svg>
				</div>

				<div
					ref={heroInnerRef}
					className="relative z-10 px-5 sm:px-6 lg:px-8"
					style={{
						transformOrigin: "center center",
						willChange: "transform, opacity",
					}}
				>
					<LandingHero />
				</div>

				{/* Bottom border */}
				<div
					className="absolute bottom-0 left-0 right-0 h-px"
					style={{
						background:
							"linear-gradient(to right, transparent 0%, var(--foreground) 30%, var(--foreground) 70%, transparent 100%)",
						opacity: 0.12,
					}}
				/>
			</div>

			{/* Diagrams + Intro */}
			<div className="relative">
				<svg
					className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 opacity-[0.08] dark:opacity-[0.06] mix-blend-overlay dark:mix-blend-soft-light"
					aria-hidden="true"
				>
					<filter id="paper-noise">
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.65"
							numOctaves="4"
							stitchTiles="stitch"
						/>
					</filter>
					<rect width="100%" height="100%" filter="url(#paper-noise)" />
				</svg>
				<div className="relative z-1">
					<LandingDiagrams />
				</div>
			</div>

			{/* Footer */}
			<LandingFooter />

			{/* Bottom smoke */}
			<div
				className="pointer-events-none sticky bottom-0 left-0 right-0 h-12 sm:h-16 z-10 -mt-12 sm:-mt-16"
				style={{
					background:
						"linear-gradient(to top, var(--background) 0%, transparent 100%)",
				}}
			/>
		</div>
	);
}
