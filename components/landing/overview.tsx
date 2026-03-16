"use client";

import { BookOpen, Code, Globe } from "lucide-react";
import { motion } from "motion/react";

function AgentIcon({ variant }: { variant: "red" | "green" }) {
	const color =
		variant === "red"
			? "text-red-400/75 dark:text-red-400/55"
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

function SectionTag({ label }: { label: string }) {
	return (
		<div className="flex items-center gap-3 mb-6">
			<span className="inline-flex items-center border border-foreground/10 dark:border-foreground/7 bg-foreground/3 dark:bg-foreground/2 px-3 py-1 text-[10px] sm:text-[11px] font-mono tracking-[0.14em] uppercase text-foreground/70 dark:text-foreground/55">
				{label}
			</span>
			<div className="h-px flex-1 bg-linear-to-r from-foreground/10 dark:from-foreground/7 to-transparent" />
		</div>
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

			{/* ═══════════════════════════════════════════════ */}
			{/*  INTRO                                          */}
			{/* ═══════════════════════════════════════════════ */}

			<div className="spec-prose mb-16">
				<p>
					Every auth model we{"'"}ve built for the web — OAuth, sessions, API keys — assumes two kinds of actors: a human user and a static application, with predefined scopes and a human in the consent loop. Agents are neither.
				</p>
				<p>
					They range from ephemeral one-shot tasks to long-running background workers and multi-step systems — calling external services without human supervision, sometimes on behalf of a user, sometimes entirely on their own.
				</p>
			</div>

			{/* ═══════════════════════════════════════════════ */}
			{/*  1 · DELEGATED AGENTS                           */}
			{/* ═══════════════════════════════════════════════ */}

			<div className="mb-16">
				<SectionTag label="Delegated agents" />
				<div className="spec-prose mb-8">
					<p>
						When an agent acts for a user, it typically reuses the user{"'"}s OAuth token or a shared client credential. That collapses the agent into someone else{"'"}s identity — the server can{"'"}t tell which agent made a request, can{"'"}t scope one differently from another, and can{"'"}t revoke one without revoking everything.
					</p>
				</div>

				<div className="border border-foreground/10 dark:border-foreground/7 overflow-hidden grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr]">
					{/* Today */}
					<div className="bg-red-400/5 p-5 sm:p-6">
						<div className="text-[11px] font-mono uppercase tracking-wider text-red-500 dark:text-red-400/70 mb-4">Today</div>
						<div className="flex items-center justify-center gap-3 sm:gap-4">
							<div className="border border-dashed border-red-400/25 dark:border-red-400/18 p-2.5 shrink-0">
								<div className="text-[8px] font-mono uppercase tracking-[0.12em] text-red-400/65 dark:text-red-400/50 mb-2 text-center">
									token: s_123
								</div>
								<div className="flex flex-col gap-1">
									{["agent_1", "agent_2", "agent_3"].map((id) => (
										<div
											key={id}
											className="flex items-center gap-1.5 px-2 py-1 border border-red-400/30 dark:border-red-400/22 bg-red-400/8 dark:bg-red-400/6"
										>
											<AgentIcon variant="red" />
											<span className="text-[10px] font-mono text-red-400/80 dark:text-red-400/60">{id}</span>
										</div>
									))}
								</div>
							</div>
							<FlowArrow />
							<ServerNode label="Server" />
						</div>
						<p className="text-[11px] text-red-400/65 dark:text-red-400/50 leading-relaxed mt-4">
							All agents share one token. The server sees the user, not the agent.
						</p>
					</div>

					{/* Divider */}
					<div className="hidden sm:block w-px bg-foreground/10 dark:bg-foreground/7" />
					<div className="sm:hidden h-px bg-foreground/10 dark:bg-foreground/7" />

					{/* With Agent Auth */}
					<div className="bg-emerald-400/3 p-5 sm:p-6">
						<div className="text-[11px] font-mono uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/50 mb-4">With Agent Auth</div>
						<div className="flex items-center justify-center gap-3 sm:gap-4">
							<div className="flex flex-col gap-1.5 shrink-0">
								{[
									{ id: "agt_1", cap: "check_balance" },
									{ id: "agt_2", cap: "transfer_funds" },
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
						<p className="text-[11px] text-emerald-600/50 dark:text-emerald-400/35 leading-relaxed mt-4">
							Each agent has its own identity. Every request traces back to a specific agent.
						</p>
					</div>
				</div>

				<div className="spec-prose mt-6">
					<p>
						Agent Auth treats each agent as a first-class principal with its own identity, granted capabilities, and lifecycle. The server sees exactly which agent is acting, what it{"'"}s authorized to do, and can revoke one without affecting anything else.
					</p>
				</div>
			</div>

			{/* ═══════════════════════════════════════════════ */}
			{/*  2 · AUTONOMOUS AGENTS                          */}
			{/* ═══════════════════════════════════════════════ */}

			<div className="mb-16">
				<SectionTag label="Autonomous agents" />
				<div className="spec-prose mb-8">
					<p>
						When an agent needs to act on its own — without a user in the loop — there{"'"}s no identity model at all. It{"'"}s forced to pretend to be a human: opening a browser, solving a CAPTCHA, clicking through a signup flow — just to use a service. There is no standard way for an agent to register itself, prove its identity, or receive capabilities without impersonating a person.
					</p>
				</div>

				<div className="border border-foreground/10 dark:border-foreground/7 overflow-hidden grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr]">
					{/* Today */}
					<div className="bg-red-400/5 p-5 sm:p-6">
						<div className="text-[11px] font-mono uppercase tracking-wider text-red-500 dark:text-red-400/70 mb-4">Today</div>
						<div className="flex items-center justify-center gap-3 sm:gap-4">
							<div className="flex flex-col gap-1.5 shrink-0">
								{["worker_1", "worker_2"].map((id) => (
									<div
										key={id}
										className="flex items-center gap-1.5 px-2 py-1 border border-red-400/30 dark:border-red-400/22 bg-red-400/8 dark:bg-red-400/6"
									>
										<AgentIcon variant="red" />
										<span className="text-[10px] font-mono text-red-400/80 dark:text-red-400/60">{id}</span>
									</div>
								))}
							</div>
							<FlowArrow />
							<div className="border border-dashed border-red-400/25 dark:border-red-400/18 px-3 py-2.5 shrink-0">
								<div className="text-[10px] font-mono text-red-400/75 dark:text-red-400/55 text-center">
									user impersonation
								</div>
								<div className="text-[9px] font-mono text-red-400/50 dark:text-red-400/38 text-center mt-0.5">
									browser, CAPTCHA, signup
								</div>
							</div>
							<FlowArrow />
							<ServerNode label="Server" />
						</div>
						<p className="text-[11px] text-red-400/65 dark:text-red-400/50 leading-relaxed mt-4">
							Autonomous agents are routed through human signup flows. The server sees one principal.
						</p>
					</div>

					{/* Divider */}
					<div className="hidden sm:block w-px bg-foreground/10 dark:bg-foreground/7" />
					<div className="sm:hidden h-px bg-foreground/10 dark:bg-foreground/7" />

					{/* With Agent Auth */}
					<div className="bg-emerald-400/3 p-5 sm:p-6">
						<div className="text-[11px] font-mono uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/50 mb-4">With Agent Auth</div>
						<div className="flex items-center justify-center gap-3 sm:gap-4">
							<div className="flex flex-col gap-1.5 shrink-0">
								{[
									{ id: "auto_1", ctx: "own keypair" },
									{ id: "auto_2", ctx: "own keypair" },
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
											{row.ctx}
										</span>
									</div>
								))}
							</div>
							<FlowArrow />
							<div className="flex flex-col gap-1 shrink-0">
								{["register", "authenticate"].map((step) => (
									<div
										key={step}
										className="flex items-center gap-2 px-3 py-1 border border-dashed border-emerald-400/15 dark:border-emerald-400/10"
									>
										<span className="text-[10px] font-mono text-emerald-500/50 dark:text-emerald-400/35">
											{step}
										</span>
									</div>
								))}
							</div>
							<FlowArrow />
							<ServerNode label="Server" />
						</div>
						<p className="text-[11px] text-emerald-600/50 dark:text-emerald-400/35 leading-relaxed mt-4">
							Each agent registers directly with its own identity and credential path.
						</p>
					</div>
				</div>

				<div className="spec-prose mt-6">
					<p>
						Agent Auth gives each autonomous agent its own identity. No user session, no impersonation. The agent registers directly, authenticates with signed JWTs, and the server attributes every action to the exact agent instance.
					</p>
				</div>
			</div>

			{/* ═══════════════════════════════════════════════ */}
			{/*  3 · DISCOVERY                                  */}
			{/* ═══════════════════════════════════════════════ */}

			<div className="mb-16">
				<SectionTag label="Discovery" />
				<div className="spec-prose mb-8">
					<p>
						There{"'"}s no standard way for a service to advertise that it supports agents, what capabilities it offers, or how an agent should begin authenticating. Every new integration requires hardcoded configuration, prior training data, or a human pointing the agent to the right endpoint.
					</p>
				</div>

				<div className="border border-foreground/10 dark:border-foreground/7 overflow-hidden grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr]">
					{/* Today */}
					<div className="bg-red-400/5 p-5 sm:p-6">
						<div className="text-[11px] font-mono uppercase tracking-wider text-red-500 dark:text-red-400/70 mb-4">Today</div>
						<div className="flex flex-col gap-1.5">
							{["find the right server", "add to config file", "create API key, paste it", "hope the agent knows how"].map((step) => (
								<div
									key={step}
									className="border border-dashed border-red-400/25 dark:border-red-400/18 px-3 py-1.5"
								>
									<span className="text-[10px] font-mono text-red-400/65 dark:text-red-400/50">{step}</span>
								</div>
							))}
						</div>
						<p className="text-[11px] text-red-400/65 dark:text-red-400/50 leading-relaxed mt-4">
							Every new service means manual setup. No standard way for agents to find and connect.
						</p>
					</div>

					{/* Divider */}
					<div className="hidden sm:block w-px bg-foreground/10 dark:bg-foreground/7" />
					<div className="sm:hidden h-px bg-foreground/10 dark:bg-foreground/7" />

					{/* With Agent Auth */}
					<div className="bg-emerald-400/3 p-5 sm:p-6">
						<div className="text-[11px] font-mono uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/50 mb-4">With Agent Auth</div>
						<div className="space-y-4">
							<div>
								<div className="text-[9px] font-mono uppercase tracking-[0.12em] text-foreground/40 dark:text-foreground/28 mb-1.5">By URL</div>
								<div className="flex items-center gap-2">
									<div className="border border-emerald-400/15 dark:border-emerald-400/10 bg-emerald-400/6 dark:bg-emerald-400/4 px-3 py-1.5 shrink-0">
										<span className="text-[10px] font-mono text-foreground/65 dark:text-foreground/50">example.com</span>
									</div>
									<FlowArrow />
									<code className="text-[9px] font-mono text-foreground/40 dark:text-foreground/28">/.well-known/agent-auth</code>
								</div>
							</div>
							<div className="h-px bg-foreground/6 dark:bg-foreground/4" />
							<div>
								<div className="text-[9px] font-mono uppercase tracking-[0.12em] text-foreground/40 dark:text-foreground/28 mb-1.5">By intent</div>
								<div className="flex items-center gap-2">
									<span className="text-[10px] font-mono text-foreground/50 dark:text-foreground/38 italic">{'"deploy my site"'}</span>
									<FlowArrow />
									<span className="text-[10px] font-mono text-foreground/65 dark:text-foreground/50">vercel.com</span>
								</div>
							</div>
						</div>
						<p className="text-[11px] text-emerald-600/50 dark:text-emerald-400/35 leading-relaxed mt-4">
							Agents discover services automatically — by URL or by intent.
						</p>
					</div>
				</div>

				<div className="spec-prose mt-6">
					<p>
						Agent Auth defines a well-known endpoint and a registry protocol so agents can find and connect to services automatically — no manual config, no hardcoded endpoints.
					</p>
				</div>
			</div>

			{/* ═══════════════════════════════════════════════ */}
			{/*  APPROACH                                       */}
			{/* ═══════════════════════════════════════════════ */}

			<div className="mt-16 mb-4">
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
						<strong>Open source:</strong> This project is developed in the open. The spec and reference implementations are open source, and we welcome contributions, feedback, and implementations from the community.
					</p>
				</div>
			</div>

			{/* ═══════════════════════════════════════════════ */}
			{/*  FAQ                                             */}
			{/* ═══════════════════════════════════════════════ */}

			<div className="mb-4">
				<h2
					className="text-xl sm:text-2xl md:text-3xl tracking-[-0.015em] font-semibold mb-8"
					style={{ fontFamily: "var(--font-display), serif" }}
				>
					FAQ
				</h2>
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
								className="text-base sm:text-lg tracking-normal font-medium mb-2.5 text-foreground/85 dark:text-foreground/75"
								style={{ fontFamily: "var(--font-content), Georgia, serif" }}
							>
								{item.q}
							</h3>
							<p
								className="text-sm sm:text-[15px] text-foreground/65 dark:text-foreground/55 leading-[1.8]"
								style={{ fontFamily: "var(--font-content), Georgia, serif" }}
							>
								{item.a}
							</p>
						</div>
					))}
				</div>
			</div>

			{/* ═══════════════════════════════════════════════ */}
			{/*  GET STARTED                                    */}
			{/* ═══════════════════════════════════════════════ */}

			<div className="mt-20 border border-foreground/10 dark:border-foreground/7">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-foreground/10 dark:bg-foreground/7">
					{[
						{
							label: "Docs",
							title: "Read the documentation",
							href: "/docs",
							icon: BookOpen,
						},
						{
							label: "SDKs",
							title: "Official implementations",
							href: "/docs/implementations",
							icon: Code,
						},
						{
							label: "Registry",
							title: "Submit your server",
							href: "/registry",
							icon: Globe,
						},
					].map((item) => (
						<a
							key={item.label}
							href={item.href}
							className="bg-background p-5 sm:p-6 flex flex-col gap-2 group transition-colors hover:bg-foreground/3 dark:hover:bg-foreground/2"
						>
							<div className="flex items-center gap-2">
								<item.icon className="w-3.5 h-3.5 text-foreground/30 dark:text-foreground/20" />
								<span className="text-[10px] font-mono uppercase tracking-[0.15em] text-foreground/30 dark:text-foreground/20">
									{item.label}
								</span>
							</div>
							<span className="text-sm font-medium text-foreground/70 dark:text-foreground/55 group-hover:text-foreground transition-colors">
								{item.title}
							</span>
						</a>
					))}
				</div>
			</div>
		</motion.article>
	);
}
