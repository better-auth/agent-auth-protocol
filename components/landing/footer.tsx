import Link from "next/link";
import { BetterAuthLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingFooter() {
	return (
		<footer className="relative w-full border-t border-foreground/10 bg-background overflow-hidden">
			<div
				className="absolute -right-16 -bottom-12 pointer-events-none select-none opacity-[0.025]"
				aria-hidden="true"
			>
				<BetterAuthLogo className="w-72 h-auto" />
			</div>

			<div
				className="absolute inset-0 pointer-events-none select-none"
				aria-hidden="true"
				style={{
					backgroundImage:
						"radial-gradient(circle, currentColor 0.5px, transparent 0.5px)",
					backgroundSize: "24px 24px",
					opacity: 0.03,
				}}
			/>

			<div className="relative px-5 sm:px-6 lg:px-7 py-6 lg:py-8">
				<div className="flex items-center justify-between">
					<span className="text-[10px] text-foreground/40 font-mono">
						© {new Date().getFullYear()} Better Auth. All rights reserved.
					</span>
					<div className="flex items-center gap-3">
						<Link
							href="https://github.com/better-auth/better-auth"
							aria-label="GitHub"
							target="_blank"
							rel="noopener noreferrer"
							className="text-foreground/45 hover:text-foreground/70 transition-colors"
						>
							<svg
								height="16"
								width="16"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
									fill="currentColor"
								/>
							</svg>
						</Link>
						<div className="h-4 w-4 flex text-foreground/25 items-center justify-center select-none">
							|
						</div>
						<ThemeToggle />
					</div>
				</div>
			</div>
		</footer>
	);
}
