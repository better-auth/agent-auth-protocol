import Link from "next/link";
import { DiscordIcon, GitHubIcon, Logo } from "@/components/icons";

export function LandingFooter() {
	return (
		<footer className="relative w-full border-foreground/10 bg-background overflow-hidden">
			<div
				className="absolute -right-16 -bottom-12 pointer-events-none select-none opacity-[0.085]"
				aria-hidden="true"
			>
				<Logo className="w-72 h-auto" />
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
					<span className="text-[10px] text-foreground/40 flex items-center gap-2">
						<Link
							href="https://better-auth.com"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground/60 transition-colors"
						>
							© Better Auth Inc.
						</Link>
						<span className="text-foreground/20">·</span>
						<a
							href="mailto:contact@better-auth.com"
							className="inline-flex items-center gap-1 hover:text-foreground/60 transition-colors"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" /><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" /></svg>
							contact@better-auth.com
						</a>
					</span>
					<div className="flex items-center gap-3">
						<Link
							href="https://discord.gg/GYC3W7tZzb"
							aria-label="Discord"
							target="_blank"
							rel="noopener noreferrer"
							className="text-foreground/45 hover:text-foreground/70 transition-colors"
						>
							<DiscordIcon height={16} width={16} />
						</Link>
						<Link
							href="https://github.com/better-auth/agent-auth"
							aria-label="GitHub"
							target="_blank"
							rel="noopener noreferrer"
							className="text-foreground/45 hover:text-foreground/70 transition-colors"
						>
							<GitHubIcon height={16} width={16} />
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
