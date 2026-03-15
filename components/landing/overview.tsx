"use client";

import { motion } from "motion/react";

function AgentIcon({ variant }: { variant: "red" | "green" }) {
	const color =
		variant === "red"
			? "text-red-400/60 dark:text-red-400/40"
			: "text-emerald-400/60 dark:text-emerald-400/40";
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

function FlowArrow() {
	return (
		<svg
			className="w-5 h-5 shrink-0 text-foreground/20 dark:text-foreground/12"
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

function SectionNumber({ n }: { n: string }) {
	return (
		<span className="text-[10px] font-mono text-foreground/30 dark:text-foreground/20 tracking-[0.2em] uppercase">
			{n}
		</span>
	);
}

export function ProtocolOverview() {
	return (
		<motion.article
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
			className="mx-auto max-w-4xl px-5 sm:px-6 py-16 sm:py-20"
		>

			<div className="spec-prose">
				<p>
					Every auth model we{"'"}ve built for the web assumes two kinds of actors: a human user and a static application, with predefined scopes. Agents are neither.
				</p>
				<p>
					They range from ephemeral one-shot tasks to long-running background workers and multi-step systems — calling external services without human supervision, sometimes on behalf of a user, sometimes entirely on their own.
				</p>
				<p>
					When an agent acts for a user, it typically reuses the user{"'"}s OAuth token or a shared client credential. That collapses the agent into someone else{"'"}s identity — the server can{"'"}t tell which agent made a request, can{"'"}t scope one differently from another, and can{"'"}t revoke one without revoking everything.
				</p>
				<p>
					When an agent needs to act on its own, there{"'"}s no identity model at all. It{"'"}s forced to pretend to be a human — opening a browser, solving a CAPTCHA, clicking through a signup flow — just to use a service.
				</p>
				<p>
					And there{"'"}s no standard way for a service to advertise that it supports agents, what capabilities it offers, or how an agent should begin authenticating.
				</p>
			</div>

			{/* ═══════════════════════════════════════════════ */}
			{/*  BEFORE / AFTER DIAGRAM                         */}
			{/* ═══════════════════════════════════════════════ */}

			<figure className="my-10">
				<div className="border border-foreground/10 dark:border-foreground/7 overflow-hidden grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr]">
					{/* Today — red */}
					<div className="bg-red-400/3 p-5 sm:p-6">
						<div className="text-[9px] font-mono uppercase tracking-[0.16em] text-red-400/50 dark:text-red-400/35 mb-4 text-center">
							Today
						</div>
						<div className="flex items-center justify-center gap-3 sm:gap-4">
							<div className="border border-dashed border-red-400/15 dark:border-red-400/10 p-2.5 shrink-0">
								<div className="text-[8px] font-mono uppercase tracking-[0.12em] text-red-400/45 dark:text-red-400/35 mb-2 text-center">
									token: s_123
								</div>
								<div className="flex flex-col gap-1">
									{["agent_1", "agent_2", "agent_3"].map((id) => (
										<div
											key={id}
											className="flex items-center gap-1.5 px-2 py-1 border border-red-400/20 dark:border-red-400/15 bg-red-400/5 dark:bg-red-400/4"
										>
											<AgentIcon variant="red" />
											<span className="text-[10px] font-mono text-red-400/60 dark:text-red-400/45">{id}</span>
										</div>
									))}
								</div>
							</div>
							<FlowArrow />
							<ServerNode label="Server" />
						</div>
					</div>

					{/* Vertical divider */}
					<div className="hidden sm:block w-px bg-foreground/10 dark:bg-foreground/7" />
					{/* Horizontal divider for mobile */}
					<div className="sm:hidden h-px bg-foreground/10 dark:bg-foreground/7" />

					{/* Agent Auth — green */}
					<div className="bg-emerald-400/3 p-5 sm:p-6">
						<div className="text-[9px] font-mono uppercase tracking-[0.16em] text-emerald-500/50 dark:text-emerald-400/35 mb-4 text-center">
							Agent Auth
						</div>
						<div className="flex items-center justify-center gap-3 sm:gap-4">
							<div className="flex flex-col gap-1.5 shrink-0">
								{[
									{ id: "agt_1", cap: "check_balance" },
									{ id: "agt_2", cap: "transfer ≤ $1k" },
									{ id: "agt_3", cap: "list_txns" },
								].map((row) => (
									<div
										key={row.id}
										className="flex items-center gap-2 px-2 py-1 bg-emerald-400/6 dark:bg-emerald-400/4 border border-emerald-400/15 dark:border-emerald-400/10"
									>
										<AgentIcon variant="green" />
										<span className="text-[10px] font-mono text-foreground/65 dark:text-foreground/50">
											{row.id}
										</span>
										<span className="text-[9px] font-mono text-foreground/35 dark:text-foreground/25">
											{row.cap}
										</span>
									</div>
								))}
							</div>
							<FlowArrow />
							<ServerNode label="Server" />
						</div>
					</div>
				</div>
				<figcaption className="mt-2.5 text-center">
					<span className="text-[9px] font-mono uppercase tracking-[0.18em] text-foreground/30 dark:text-foreground/20">
						Fig. 1
					</span>
					<span className="text-[11px] text-foreground/40 dark:text-foreground/28 ml-1.5">
						Shared identity vs. per-agent identity
					</span>
				</figcaption>
			</figure>

			<div className="spec-prose">
				<p>
					Agent Auth makes the runtime agent a first-class principal. Each agent is registered with its own identity, granted specific capabilities, and managed through a lifecycle — giving the server a durable way to identify which agent is acting, what it{"'"}s authorized to do, and how to revoke it without affecting anything else.
				</p>
				<p>The specification covers three things:</p>
			</div>

			{/* ═══════════════════════════════════════════════ */}
			{/*  PILLAR CARDS                                   */}
			{/* ═══════════════════════════════════════════════ */}

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-px my-8 border border-foreground/10 dark:border-foreground/7 bg-foreground/10 dark:bg-foreground/7">
				{[
					{
						n: "01",
						title: "Delegated Agents",
						desc: "Acting for a user without impersonating them.",
					},
					{
						n: "02",
						title: "Autonomous Agents",
						desc: "Acting on its own without a user in the loop.",
					},
					{
						n: "03",
						title: "Discovery",
						desc: "Finding and connecting to services automatically.",
					},
				].map((item) => (
					<div
						key={item.n}
						className="bg-background p-5 sm:p-6 flex flex-col gap-3"
					>
						<span className="text-[10px] font-mono text-foreground/25 dark:text-foreground/18 tracking-[0.15em]">
							{item.n}
						</span>
						<h3
							className="text-base sm:text-lg tracking-[-0.01em] font-semibold"
							style={{ fontFamily: "var(--font-display), serif" }}
						>
							{item.title}
						</h3>
						<p className="text-[13px] text-foreground/50 dark:text-foreground/38 leading-relaxed">
							{item.desc}
						</p>
					</div>
				))}
			</div>

			{/* ═══════════════════════════════════════════════ */}
			{/*  APPROACH                                       */}
			{/* ═══════════════════════════════════════════════ */}

			<div className="mt-20 mb-4">
				<h2
					className="text-xl sm:text-2xl md:text-3xl tracking-[-0.015em] font-semibold mb-6"
					style={{ fontFamily: "var(--font-display), serif" }}
				>
					Approach
				</h2>

				<div className="spec-prose">
					<p>
						<strong>Comprehensive:</strong> This protocol is intentionally broad. It covers everything from intent-based service lookup to constrained capabilities to action execution. It's designed to work with existing infrastructure without requiring a lot of assumptions or changes.
					</p>
					<p>
						<strong>Implementation-oriented:</strong> This protocol ships with official implementations. We expect most use cases to be served through them. The specification exists to enable additional implementations and custom use cases.
					</p>
					<p>
						<strong>Open source:</strong> This project is meant to be collaborative in the open source, with a core team as benevolent leaders. We have no intention to make this part of a committee or standardized by any standards body.
					</p>
				</div>
			</div>

			{/* ═══════════════════════════════════════════════ */}
			{/*  FAQ                                             */}
			{/* ═══════════════════════════════════════════════ */}

			<div className="mt-20 mb-4">
				<div className="space-y-10">
					{[
						{
							q: "Why not use MCP auth?",
							a: "MCP uses OAuth 2.1 for authentication. OAuth was designed for users authorizing 3rd party applications instead of sharing credentials — it has no concept of per-agent identity, capability-based authorization, or agent lifecycle. When three agents use the same MCP server through OAuth, the server sees one client, not three agents. Agent Auth can sit alongside MCP — services can expose capabilities through MCP tools while using Agent Auth for the identity and authorization layer.",
						},
						{
							q: "Is this an OAuth replacement?",
							a: "No. Agent Auth is not meant to compete with or replace OAuth in the general sense. OAuth solves a different problem: letting a user grant a third-party application access to their resources. Agent Auth is a single protocol purpose-built for agent identity, registration, capabilities, and discovery. If you purely support Agent Auth, you don't need an OAuth server, but a server may still support OAuth for users to authorize applications.",
						},
						{
							q: "Is this tied to Better Auth?",
							a: "No. This specification and its implementations are created and maintained by the Better Auth team, but they are not tied to Better Auth. You don't need Better Auth to implement or use Agent Auth. The protocol is designed to be adopted independently by any platform or provider.",
						},
					].map((item) => (
						<div key={item.q}>
							<h3
								className="text-base sm:text-lg tracking-normal font-medium mb-2 text-foreground/80 dark:text-foreground/70"
								style={{ fontFamily: "var(--font-content), Georgia, serif" }}
							>
								{item.q}
							</h3>
							<p
								className="text-sm sm:text-base text-foreground/70 dark:text-foreground/50 leading-relaxed"
								style={{ fontFamily: "var(--font-content), Georgia, serif" }}
							>
								{item.a}
							</p>
						</div>
					))}
				</div>
			</div>
		</motion.article>
	);
}
