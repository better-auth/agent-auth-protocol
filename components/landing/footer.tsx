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
					<span className="text-[10px] text-foreground/40 ">
		
						<Link
							href="https://better-auth.com"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground/60 transition-colors"
						>
							©
							Better Auth Inc.
						</Link>
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
