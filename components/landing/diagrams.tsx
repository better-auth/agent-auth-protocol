"use client";

import { motion } from "motion/react";

function AgentIcon({ variant }: { variant: "red" | "green" | "default" }) {
	const color =
		variant === "red"
			? "text-red-500 dark:text-red-400/80"
			: variant === "green"
				? "text-emerald-600 dark:text-emerald-400/90"
				: "text-foreground/40";
	return (
		<svg
			className={`w-3.5 h-3.5 ${color}`}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect width="8" height="8" x="3" y="3" rx="2" />
			<path d="M7 11v4a2 2 0 0 0 2 2h4" />
			<rect width="8" height="8" x="13" y="13" rx="2" />
		</svg>
	);
}

function AgentNode({
	id,
	variant = "default",
}: { id: string; variant?: "default" | "green" | "red" }) {
	const border =
		variant === "red"
			? "border-red-500/35 dark:border-red-500/20"
			: variant === "green"
				? "border-emerald-600/30 dark:border-emerald-500/20"
				: "border-foreground/10";
	const bg =
		variant === "red"
			? "bg-red-500/8 dark:bg-red-500/5"
			: variant === "green"
				? "bg-emerald-500/8 dark:bg-emerald-500/5"
				: "bg-foreground/3";
	const text =
		variant === "red"
			? "text-red-600 dark:text-red-300/80"
			: variant === "green"
				? "text-emerald-700 dark:text-emerald-300/90"
				: "text-foreground/60";

	return (
		<div
			className={`flex items-center gap-2 px-2.5 py-1.5 border ${border} ${bg}`}
		>
			<AgentIcon variant={variant} />
			<span className={`text-[11px] font-mono ${text}`}>{id}</span>
		</div>
	);
}

function FlowArrow({
	variant = "default",
}: { variant?: "default" | "red" | "green" }) {
	const color =
		variant === "red"
			? "text-red-500/50 dark:text-red-500/30"
			: variant === "green"
				? "text-emerald-500/60 dark:text-emerald-500/40"
				: "text-foreground/25 dark:text-foreground/15";
	return (
		<svg
			className={`w-5 h-5 shrink-0 ${color}`}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M5 12h14" />
			<path d="m12 5 7 7-7 7" />
		</svg>
	);
}

function Figure({
	id,
	caption,
	variant = "default",
	children,
}: {
	id: string;
	caption: string;
	variant?: "problem" | "after" | "default";
	children: React.ReactNode;
}) {
	const border =
		variant === "problem"
			? "border-red-500/20 dark:border-red-500/10"
			: variant === "after"
				? "border-emerald-500/20 dark:border-emerald-500/10"
				: "border-border";

	return (
		<figure className="my-8">
			<div className={`border ${border} bg-background/50 p-5 sm:p-6`}>
				<div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
					{children}
				</div>
			</div>
			<figcaption className="mt-2.5 text-center">
				<span className="text-[9px] font-mono uppercase tracking-[0.18em] text-foreground/30 dark:text-foreground/20">
					{id}
				</span>
				<span className="text-[11px] text-foreground/40 dark:text-foreground/28 ml-1.5">
					{caption}
				</span>
			</figcaption>
		</figure>
	);
}

function ServerNode({ label }: { label: string }) {
	return (
		<div className="flex flex-col items-center gap-1.5">
			<div className="relative w-10 h-10 flex items-center justify-center">
				<svg
					className="absolute inset-0 w-full h-full text-foreground/30 dark:text-foreground/15"
					viewBox="0 0 40 40"
				>
					<rect x="1" y="1" width="38" height="38" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
					<line x1="1" y1="14" x2="39" y2="14" stroke="currentColor" strokeWidth="0.5" />
					<line x1="1" y1="27" x2="39" y2="27" stroke="currentColor" strokeWidth="0.5" />
					<circle cx="8" cy="8" r="1.5" fill="currentColor" opacity="0.6" />
					<circle cx="8" cy="21" r="1.5" fill="currentColor" opacity="0.6" />
					<circle cx="8" cy="34" r="1.5" fill="currentColor" opacity="0.6" />
				</svg>
			</div>
			<span className="text-[9px] font-mono text-foreground/55 dark:text-foreground/45 tracking-wider uppercase">
				{label}
			</span>
		</div>
	);
}

export function LandingDiagrams() {
	return (
		<motion.article
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
			className="mx-auto max-w-4xl px-5 sm:px-6 py-16 sm:py-20"
		>
			<h2
				className="text-2xl sm:text-3xl md:text-4xl tracking-[-0.015em] font-semibold mb-8"
				style={{ fontFamily: "var(--font-display), serif" }}
			>
				Agent Auth
			</h2>

			<div className="spec-prose">
				<p>
					Agent Auth is an open protocol for AI agent authentication,
					authorization and service discovery.
				</p>
				<p>
					AI agents are becoming long-lived actors: copilots, background
					workers, scheduled automations, and multi-step systems that call
					external services without constant human supervision. Today's auth
					models were not designed with this in mind.
				</p>
				<p>
					An agent reuses the user's OAuth token or a shared client credential
					— collapsing the runtime agent into someone else's identity. There's
					no per-agent visibility, no scoping, no isolation. You can't revoke
					one agent without revoking all of them.
				</p>
			</div>

			{/* Delegated agents */}
			<h3
				className="text-lg sm:text-xl tracking-[-0.01em] font-semibold mt-14 mb-4"
				style={{ fontFamily: "var(--font-display), serif" }}
			>
				Delegated agents
			</h3>

			<div className="spec-prose">
				<p>
					When an agent acts on behalf of a user, it typically reuses the
					user's token. That collapses the agent into the user's identity —
					the server sees a single principal regardless of how many agents
					are running.
				</p>
			</div>

			<Figure id="Fig. 1a" caption="All agents share one token" variant="problem">
				<div className="flex flex-col gap-2 shrink-0">
					<AgentNode id="agent_01" variant="red" />
					<AgentNode id="agent_02" variant="red" />
					<AgentNode id="agent_03" variant="red" />
				</div>
				<FlowArrow variant="red" />
				<div className="shrink-0 flex flex-col items-center gap-2">
					<div className="border border-dashed border-red-500/35 dark:border-red-500/20 px-4 py-2.5">
						<div className="text-[10px] font-mono text-red-600 dark:text-red-300/70 text-center">
							user_oauth_xyz
						</div>
						<div className="text-[9px] font-mono text-foreground/50 dark:text-foreground/35 text-center mt-0.5">
							shared token
						</div>
					</div>
				</div>
				<FlowArrow variant="red" />
				<ServerNode label="Bank API" />
			</Figure>

			<div className="spec-prose">
				<p>
					Agent Auth gives each agent its own identity and scoped
					capabilities. Every request traces back to a specific agent,
					and each can be revoked independently.
				</p>
			</div>

			<Figure id="Fig. 1b" caption="Each agent gets its own identity" variant="after">
				<div className="flex flex-col gap-2 shrink-0">
					<AgentNode id="agent_01" variant="green" />
					<AgentNode id="agent_02" variant="green" />
					<AgentNode id="agent_03" variant="green" />
				</div>
				<FlowArrow variant="green" />
				<div className="shrink-0 flex flex-col gap-1.5">
					{[
						{ id: "agt_1", cap: "check_balance" },
						{ id: "agt_2", cap: "transfer_funds" },
						{ id: "agt_3", cap: "list_txns" },
					].map((row) => (
						<div
							key={row.id}
							className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/8 dark:bg-emerald-500/5 border border-emerald-600/25 dark:border-emerald-500/15"
						>
							<div className="w-1 h-1 rounded-full bg-emerald-500/70 dark:bg-emerald-500/50" />
							<span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300/80">
								{row.id}
							</span>
							<span className="text-[10px] font-mono text-foreground/60 dark:text-foreground/40">
								{row.cap}
							</span>
						</div>
					))}
				</div>
				<FlowArrow variant="green" />
				<ServerNode label="Bank API" />
			</Figure>

			{/* Autonomous agents */}
			<h3
				className="text-lg sm:text-xl tracking-[-0.01em] font-semibold mt-14 mb-4"
				style={{ fontFamily: "var(--font-display), serif" }}
			>
				Autonomous agents
			</h3>

			<div className="spec-prose">
				<p>
					Background workers and service-to-service agents need to
					authenticate without a user session. Today they typically
					inherit a human's credentials or share a single service
					account — the server cannot distinguish between them.
				</p>
			</div>

			<Figure id="Fig. 2a" caption="Server can't tell which agent acted" variant="problem">
				<div className="flex flex-col gap-2 shrink-0">
					<AgentNode id="worker_1" variant="red" />
					<AgentNode id="worker_2" variant="red" />
					<AgentNode id="worker_3" variant="red" />
				</div>
				<FlowArrow variant="red" />
				<div className="shrink-0 flex flex-col items-center gap-2">
					<div className="border border-dashed border-red-500/35 dark:border-red-500/20 px-4 py-2.5">
						<div className="text-[10px] font-mono text-red-600 dark:text-red-300/70 text-center">
							shared credential C
						</div>
						<div className="text-[9px] font-mono text-foreground/50 dark:text-foreground/35 text-center mt-0.5">
							impersonation
						</div>
					</div>
				</div>
				<FlowArrow variant="red" />
				<ServerNode label="Server" />
			</Figure>

			<div className="spec-prose">
				<p>
					With Agent Auth, each autonomous agent gets its own credential
					path — its own keypair and identity. No user session required,
					no impersonation. The server attributes every action to the
					exact agent instance.
				</p>
			</div>

			<Figure id="Fig. 2b" caption="Every action traces to an agent" variant="after">
				<div className="flex flex-col gap-2 shrink-0">
					<AgentNode id="worker_1" variant="green" />
					<AgentNode id="worker_2" variant="green" />
					<AgentNode id="worker_3" variant="green" />
				</div>
				<FlowArrow variant="green" />
				<div className="shrink-0 flex flex-col gap-1.5">
					{[
						{ id: "auto_1", ctx: "own keypair" },
						{ id: "auto_2", ctx: "own keypair" },
						{ id: "auto_3", ctx: "own keypair" },
					].map((row) => (
						<div
							key={row.id}
							className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/8 dark:bg-emerald-500/5 border border-emerald-600/25 dark:border-emerald-500/15"
						>
							<div className="w-1 h-1 rounded-full bg-emerald-500/70 dark:bg-emerald-500/50" />
							<span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300/80">
								{row.id}
							</span>
							<span className="text-[10px] font-mono text-foreground/60 dark:text-foreground/40">
								{row.ctx}
							</span>
						</div>
					))}
				</div>
				<FlowArrow variant="green" />
				<ServerNode label="Server" />
			</Figure>

			{/* Discovery */}
			<h3
				className="text-lg sm:text-xl tracking-[-0.01em] font-semibold mt-14 mb-4"
				style={{ fontFamily: "var(--font-display), serif" }}
			>
				Discovery
			</h3>

			<div className="spec-prose">
				<p>
					There is no standard way for a service to advertise that it
					supports agents. Every new integration requires hardcoded
					configuration or a human pointing the agent to the right
					endpoint.
				</p>
			</div>

			<figure className="my-8">
				<div className="border border-red-500/20 dark:border-red-500/10 bg-background/50 p-5 sm:p-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
						{[
							{ n: "01", step: "Find the right MCP server" },
							{ n: "02", step: "Add it to your config file" },
							{ n: "03", step: "Create API key, paste it in" },
							{ n: "04", step: "Hope the agent knows how to use it" },
						].map((item) => (
							<div
								key={item.n}
								className="flex items-start gap-3 border border-dashed border-red-500/30 dark:border-red-500/15 px-3.5 py-2.5"
							>
								<span className="text-[9px] font-mono text-red-500 dark:text-red-400/50 mt-0.5 shrink-0">
									{item.n}
								</span>
								<span className="text-[11px] font-mono text-foreground/65 dark:text-foreground/50 leading-relaxed">
									{item.step}
								</span>
							</div>
						))}
					</div>
				</div>
				<figcaption className="mt-2.5 text-center">
					<span className="text-[9px] font-mono uppercase tracking-[0.18em] text-foreground/30 dark:text-foreground/20">
						Fig. 3a
					</span>
					<span className="text-[11px] text-foreground/40 dark:text-foreground/28 ml-1.5">
						Every service needs manual setup
					</span>
				</figcaption>
			</figure>

			<div className="spec-prose">
				<p>
					A well-known endpoint lets agents discover capabilities, auth
					methods, and approval flows automatically. Agents can resolve
					a URL or query a registry to find matching providers.
				</p>
			</div>

			<figure className="my-8">
				<div className="border border-emerald-500/20 dark:border-emerald-500/10 bg-background/50 p-5 sm:p-6">
					<div className="space-y-4">
						<div>
							<div className="text-[9px] font-mono uppercase tracking-[0.16em] text-foreground/50 dark:text-foreground/35 mb-2.5">
								By URL
							</div>
							<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
								<div className="border border-emerald-600/25 dark:border-emerald-500/15 bg-emerald-500/8 dark:bg-emerald-500/5 px-3.5 py-2 shrink-0">
									<span className="text-[11px] font-mono text-foreground/70 dark:text-foreground/60">
										example.com
									</span>
								</div>
								<FlowArrow variant="green" />
								<div className="border border-foreground/12 dark:border-foreground/8 bg-foreground/4 dark:bg-foreground/3 px-3.5 py-2 flex-1">
									<code className="text-[10px] font-mono text-foreground/60 dark:text-foreground/45">
										/.well-known/agent-configuration
									</code>
								</div>
								<FlowArrow variant="green" />
								<div className="border border-emerald-600/25 dark:border-emerald-500/15 bg-emerald-500/8 dark:bg-emerald-500/5 px-3.5 py-2 shrink-0">
									<span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400/80">
										connected
									</span>
								</div>
							</div>
						</div>

						<div className="h-px bg-foreground/8 dark:bg-foreground/5" />

						<div>
							<div className="text-[9px] font-mono uppercase tracking-[0.16em] text-foreground/50 dark:text-foreground/35 mb-2.5">
								By intent
							</div>
							<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
								<div className="border border-foreground/12 dark:border-foreground/8 bg-foreground/4 dark:bg-foreground/3 px-3.5 py-2 flex-1">
									<span className="text-[11px] font-mono text-foreground/65 dark:text-foreground/50 italic">
										"deploy my site to production"
									</span>
								</div>
								<FlowArrow variant="green" />
								<div className="border border-emerald-600/25 dark:border-emerald-500/15 bg-emerald-500/8 dark:bg-emerald-500/5 px-3.5 py-2 shrink-0 flex items-center gap-2">
									<span className="text-[11px] font-mono text-foreground/70 dark:text-foreground/60">
										example.com
									</span>
									<span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400/60">
										best match
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<figcaption className="mt-2.5 text-center">
					<span className="text-[9px] font-mono uppercase tracking-[0.18em] text-foreground/30 dark:text-foreground/20">
						Fig. 3b
					</span>
					<span className="text-[11px] text-foreground/40 dark:text-foreground/28 ml-1.5">
						Agents discover services automatically
					</span>
				</figcaption>
			</figure>
		</motion.article>
	);
}
