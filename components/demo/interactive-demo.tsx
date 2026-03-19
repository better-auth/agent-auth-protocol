"use client";

import { useRef, useState, useEffect, useCallback, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "motion/react";
import {
	PaperPlaneIcon,
	LockClosedIcon,
	EnvelopeClosedIcon,
	LightningBoltIcon,
	ExclamationTriangleIcon,
	ActivityLogIcon,
	LinkBreak2Icon,
	StopIcon,
	ChevronRightIcon,
	ReaderIcon,
	Cross2Icon,
	CheckIcon,
	ArrowRightIcon,
	MagnifyingGlassIcon,
	ExternalLinkIcon,
	ListBulletIcon,
	TargetIcon,
	PlayIcon,
	LayersIcon,
} from "@radix-ui/react-icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/* ─── Walkthrough prompts ───────────────────────────────────── */

interface WalkthroughPrompt {
	prompt?: string;
	promptTemplate?: string;
}

const WALKTHROUGH_PROMPTS: WalkthroughPrompt[] = [
	{ prompt: 'Create a simple HTML site called "lovely-pie" — with your own expression' },
	{ promptTemplate: 'Send an email to agent@better-auth.com with the subject "I just tried Agent Auth!" and include the deployed URL' },
	{ prompt: "Summarize my most recent email in one sentence" },
];

/* ─── Protocol phases (sidebar educational content) ─────────── */

interface SpecLink {
	label: string;
	href: string;
}

interface ProtocolPhase {
	id: string;
	title: string;
	description: string;
	specLinks?: SpecLink[];
}

const PROTOCOL_PHASES: Record<string, ProtocolPhase> = {
	discovery: {
		id: "discovery",
		title: "Discovery",
		description:
			"The agent searches a **[directory](/directory)** for providers that match what the user needs. Servers publish a discovery document at a well-known URL, and directories index them. The directory can be public, private, or disabled entirely — in which case the client is given a pre-configured set of providers.",
		specLinks: [
			{ label: "§5.1 Discovery", href: "/specification#51-discovery" },
			{ label: "§6.2 Discovering Providers", href: "/specification#62-discovering-providers" },
		],
	},
	registration: {
		id: "registration",
		title: "Agent Registration",
		description:
			"The agent generates an **Ed25519 keypair** and registers with the provider in **delegated mode** — meaning it will act on a user's behalf. The provider returns a device authorization challenge.",
		specLinks: [
			{ label: "§5.3 Agent Registration", href: "/specification#53-agent-registration" },
			{ label: "§6.4 connect_agent", href: "/specification#64-connect_agent" },
		],
	},
	consent: {
		id: "consent",
		title: "User Consent",
		description:
			"The user approves the agent's access via a **device authorization** flow or other approval methods. They sign in, see what capabilities the agent is requesting, and can approve or deny.",
		specLinks: [
			{ label: "§7.1 Device Authorization", href: "/specification#71-device-authorization-rfc-8628" },
		],
	},
	autonomous: {
		id: "autonomous",
		title: "Autonomous Connection",
		description:
			"The agent registers with a provider in **autonomous mode** — working without a user account. This lets an agent discover, sign up, and operate under its own identity without human approval. The user can later **claim the agent** and its activities.",
		specLinks: [
			{ label: "§2.2.2 Autonomous Agents", href: "/specification#222-autonomous-agents" },
			{ label: "§5.3 Agent Registration", href: "/specification#53-agent-registration" },
		],
	},
	execution: {
		id: "execution",
		title: "Capability Execution",
		description:
			"The agent signs an **agent JWT** scoped to specific capabilities and sends it to the server. The server verifies the signature, checks the grant, and executes the action. Every call is scoped and traceable.",
		specLinks: [
			{ label: "§5.11 Execute Capability", href: "/specification#511-execute-capability" },
			{ label: "§6.10 execute_capability", href: "/specification#610-execute_capability" },
		],
	},
	escalation: {
		id: "escalation",
		title: "Capability Escalation",
		description:
			"The agent requests a capability it doesn't have yet. This triggers **progressive consent** — a new approval for only the additional permission, without re-approving existing ones.",
		specLinks: [
			{ label: "§5.4 Request Capability", href: "/specification#54-request-capability" },
			{ label: "§6.6 request_capability", href: "/specification#66-request_capability" },
		],
	},
	async_auth: {
		id: "async_auth",
		title: "Async Auth Approval (CIBA)",
		description:
			"The provider uses **asynchronous authorization** based on **CIBA** (Client-Initiated Backchannel Authentication) — the agent initiates the request, and the user approves out-of-band (e.g. in the provider's dashboard) while the agent waits. This decouples the approval step from the agent's session, so the user can review and grant permissions at their own pace.",
		specLinks: [
			{ label: "§7.2 CIBA", href: "/specification#72-ciba-client-initiated-backchannel-authentication" },
		],
	},
	claim: {
		id: "claim",
		title: "Agent Claiming",
		description:
			"The user **claims ownership** of resources created by an autonomous agent. They approve via a browser flow, and the agent's resources (like deployed sites) transfer to their account.",
		specLinks: [
			{ label: "§2.10 Autonomous Agent Claiming", href: "/specification#210-autonomous-agent-claiming" },
		],
	},
};

const PHASE_ORDER = ["discovery", "registration", "consent", "autonomous", "execution", "escalation", "async_auth", "claim"];

/* ─── Tool call dialog ──────────────────────────────────────── */

function ToolCallDialog({ tool, onClose }: { tool: PhaseToolCall; onClose: () => void }) {
	const meta = TOOL_META[tool.toolName];
	const Icon = meta?.icon ?? LightningBoltIcon;
	const label = meta?.label ?? tool.toolName;
	const hasError = tool.state === "error" || (tool.output && typeof tool.output === "object" && "error" in (tool.output as Record<string, unknown>));

	return (
		<div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
			<div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
			<motion.div
				initial={{ opacity: 0, y: 12, scale: 0.97 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.18 }}
				className="relative w-full sm:max-w-lg border border-foreground/10 bg-background shadow-xl shadow-foreground/5 z-10 max-h-[85dvh] flex flex-col"
			>
				<div className="flex items-center gap-2.5 px-4 py-3 border-b border-foreground/8 shrink-0">
					<Icon className="w-3.5 h-3.5 text-foreground/30" />
					<span className="text-[13px] font-medium text-foreground/70 flex-1">{label}</span>
				<span className={`text-[10px] font-mono uppercase tracking-[0.1em] px-1.5 py-0.5 ${hasError ? "text-destructive/60 bg-destructive/5 border border-destructive/10" : tool.state === "running" ? "text-foreground/35 bg-foreground/3 border border-foreground/8 tool-running" : "text-emerald-600/70 dark:text-emerald-400/70 bg-emerald-500/5 border border-emerald-500/12"}`}>
					{tool.state === "running" ? "running" : hasError ? "error" : "done"}
				</span>
					<button type="button" onClick={onClose} className="p-1 text-foreground/30 hover:text-foreground/60 transition-colors cursor-pointer">
						<Cross2Icon className="w-3.5 h-3.5" />
					</button>
				</div>
				<div className="overflow-y-auto p-4 space-y-3">
					{tool.input != null && (
						<div>
							<span className="text-[10px] font-mono uppercase tracking-[0.12em] text-foreground/30 block mb-1.5">Input</span>
						<pre className="text-[12px] font-mono text-foreground/50 whitespace-pre-wrap break-all leading-relaxed p-3 bg-foreground/2 border border-foreground/6 max-h-[200px] overflow-y-auto">{formatJson(tool.input, false)}</pre>
					</div>
				)}
				{tool.output != null && (
					<div>
						<span className="text-[10px] font-mono uppercase tracking-[0.12em] text-foreground/30 block mb-1.5">Output</span>
						<pre className={`text-[12px] font-mono whitespace-pre-wrap break-all leading-relaxed p-3 border max-h-[280px] overflow-y-auto ${hasError ? "text-destructive/60 bg-destructive/3 border-destructive/10" : "text-foreground/50 bg-foreground/2 border-foreground/6"}`}>{formatJson(tool.output, false)}</pre>
						</div>
					)}
				{tool.state === "running" && (
					<div className="flex items-center gap-2 py-3 justify-center text-foreground/30 tool-running">
						<span className="text-[12px] font-mono">Running…</span>
					</div>
				)}
				</div>
			</motion.div>
		</div>
	);
}

/* ─── Protocol progress bar (mobile header) ────────────────── */

function ProtocolProgressBar({
	activePhases,
	completedPhases,
	onOpen,
}: {
	activePhases: Set<string>;
	completedPhases: Set<string>;
	onOpen: () => void;
}) {
	const visiblePhases = PHASE_ORDER.filter(
		(id) => activePhases.has(id) || completedPhases.has(id)
	);

	if (visiblePhases.length === 0) return null;

	return (
		<button
			type="button"
			onClick={onOpen}
			className="lg:hidden flex items-center gap-2 px-3 sm:px-5 py-2 border-b border-foreground/6 hover:bg-foreground/[0.04] transition-colors cursor-pointer w-full overflow-x-auto no-scrollbar"
		>
			<div className="flex items-center gap-2.5 min-w-0">
				{visiblePhases.map((id) => {
					const phase = PROTOCOL_PHASES[id];
					const isActive = activePhases.has(id);
					const isLatest = id === visiblePhases[visiblePhases.length - 1];
					return (
						<div key={id} className="flex items-center gap-1.5 shrink-0">
							{isActive ? (
								<span className="w-2 h-2 rounded-full bg-foreground/15 tool-running shrink-0" />
							) : (
								<CheckIcon className="w-2.5 h-2.5 text-emerald-500/60 shrink-0" />
							)}
							<span className={`text-[11px] font-mono whitespace-nowrap ${isLatest ? "text-foreground/50" : "text-foreground/25"}`}>
								{phase.title}
							</span>
						</div>
					);
				})}
			</div>
			<ChevronRightIcon className="w-3 h-3 text-foreground/20 shrink-0 ml-auto" />
		</button>
	);
}

/* ─── Sidebar ───────────────────────────────────────────────── */

const mdComponents = {
	p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
	strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-foreground/75">{children}</strong>,
	code: ({ children }: { children?: React.ReactNode }) => <code className="text-[12px] font-mono px-1 py-px bg-foreground/5 border border-foreground/8">{children}</code>,
	a: ({ href, children }: { href?: string; children?: React.ReactNode }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-foreground/75 hover:text-foreground/90 transition-colors">{children}</a>,
};

function Sidebar({
	activePhases,
	completedPhases,
	discoveredProviders,
	toolsByPhase,
	sidebarOpen,
	onClose,
}: {
	activePhases: Set<string>;
	completedPhases: Set<string>;
	discoveredProviders: DiscoveredProvider[];
	toolsByPhase: Record<string, PhaseToolCall[]>;
	sidebarOpen: boolean;
	onClose: () => void;
}) {
	const sidebarEndRef = useRef<HTMLDivElement>(null);
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const [selectedTool, setSelectedTool] = useState<PhaseToolCall | null>(null);
	const visiblePhases = PHASE_ORDER
		.filter((id) => activePhases.has(id) || completedPhases.has(id))
		.map((id) => PROTOCOL_PHASES[id]);

	useEffect(() => {
		sidebarEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [visiblePhases.length]);

	return (
		<>
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
					onClick={onClose}
				/>
			)}
			<div
				className={`${sidebarOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0 fixed lg:static right-0 top-0 bottom-0 z-50 lg:z-auto w-[calc(100vw-3rem)] sm:w-[320px] lg:w-[400px] border-l border-foreground/8 bg-background overflow-y-auto transition-transform duration-200 lg:transition-none`}
			>
				<div className="p-4 space-y-3">
					<button
						type="button"
						onClick={onClose}
						className="lg:hidden absolute top-3 right-3 p-1 text-foreground/30 hover:text-foreground/60 cursor-pointer"
					>
						<Cross2Icon className="w-4 h-4" />
					</button>

					<div className="flex items-center gap-2">
						<ReaderIcon className="w-3.5 h-3.5 text-foreground/25" />
						<span className="text-[10px] font-mono uppercase tracking-[0.14em] text-foreground/35">
							What{"'"}s happening
						</span>
					</div>

					{visiblePhases.length === 0 && (
						<div className="py-6 text-center">
							<p className="text-[12.5px] text-foreground/20" style={{ fontFamily: "var(--font-content), Georgia, serif" }}>
								Protocol phases will appear here as the demo progresses.
							</p>
						</div>
					)}

					{visiblePhases.map((phase, i) => {
						const isActive = activePhases.has(phase.id);
						const isLatest = i === visiblePhases.length - 1;
						const isOpen = isActive || isLatest || expandedId === phase.id;
						const isCollapsedDone = !isActive && !isLatest;
						const phaseTools = toolsByPhase[phase.id] ?? [];
						return (
							<motion.div
								key={phase.id}
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.25 }}
								className={`border bg-foreground/2 ${isLatest ? "border-foreground/10" : "border-foreground/5"}`}
							>
								<button
									type="button"
									onClick={() => isCollapsedDone && setExpandedId(expandedId === phase.id ? null : phase.id)}
									className={`w-full px-3.5 py-2.5 ${isOpen ? "border-b border-foreground/5" : ""} flex items-center gap-2 ${isCollapsedDone ? "cursor-pointer hover:bg-foreground/2" : "cursor-default"} transition-colors`}
								>
								{isActive ? (
									<span className="w-3 h-3 rounded-full bg-foreground/15 tool-running shrink-0" />
								) : (
									<CheckIcon className="w-3 h-3 text-emerald-500/70" />
								)}
									<span className={`text-[13px] font-medium ${isLatest ? "text-foreground/65" : "text-foreground/40"} flex-1 text-left`}>
										{phase.title}
									</span>
									{isCollapsedDone && (
										<ChevronRightIcon className={`w-3 h-3 text-foreground/20 transition-transform ${expandedId === phase.id ? "rotate-90" : ""}`} />
									)}
								</button>
								<AnimatePresence initial={false}>
									{isOpen && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.2 }}
											className="overflow-hidden"
										>
										<div className="px-3.5 py-3 space-y-2.5">
											<div className={`text-[13.5px] leading-[1.75] ${isLatest ? "text-foreground/55" : "text-foreground/40"}`}>
												<ReactMarkdown components={mdComponents}>
													{phase.description}
												</ReactMarkdown>
											</div>
											{phase.specLinks && phase.specLinks.length > 0 && (
												<div className="flex flex-wrap gap-x-3 gap-y-1">
													{phase.specLinks.map((link) => (
														<a
															key={link.href}
															href={link.href}
															target="_blank"
															rel="noopener noreferrer"
															className="text-[11px] font-mono text-foreground/25 hover:text-foreground/50 underline underline-offset-2 decoration-foreground/10 hover:decoration-foreground/30 transition-colors"
														>
															{link.label}
														</a>
													))}
												</div>
											)}
											{phase.id === "discovery" && !isActive && discoveredProviders.length > 0 && (
												<div className="space-y-1">
													<span className="text-[10px] font-mono uppercase tracking-[0.12em] text-foreground/25">
														Found {discoveredProviders.length} provider{discoveredProviders.length !== 1 ? "s" : ""}
													</span>
													{discoveredProviders.map((p) => (
														<div key={p.url} className="flex items-center gap-2 px-2.5 py-1.5 bg-foreground/3 border border-foreground/5 text-[12px]">
															<ExternalLinkIcon className="w-3 h-3 text-foreground/25 shrink-0" />
															<span className="text-foreground/50 font-medium truncate">{p.name}</span>
															<span className="text-foreground/20 font-mono text-[10px] truncate ml-auto">{p.url.replace(/^https?:\/\//, "")}</span>
														</div>
													))}
												</div>
											)}
											{phaseTools.length > 0 && (
												<div className="space-y-1">
													<span className="text-[10px] font-mono uppercase tracking-[0.12em] text-foreground/25">
														Tool calls
													</span>
													<div className="flex flex-wrap gap-1">
														{phaseTools.map((tc, j) => {
															const meta = TOOL_META[tc.toolName] ?? { label: tc.toolName, icon: LightningBoltIcon };
															const TIcon = meta.icon;
															const hasErr = tc.state === "error" || (tc.output && typeof tc.output === "object" && "error" in (tc.output as Record<string, unknown>));
															return (
															<button
																key={j}
																type="button"
																onClick={() => setSelectedTool(tc)}
																className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono border transition-colors cursor-pointer ${tc.state === "running" ? "border-foreground/10 bg-foreground/3 text-foreground/35 hover:bg-foreground/5 tool-running" : hasErr ? "border-destructive/15 bg-destructive/3 text-destructive/50 hover:bg-destructive/6" : "border-foreground/6 bg-foreground/3 text-foreground/35 hover:bg-foreground/5 hover:text-foreground/50"}`}
															>
																{tc.state === "running" ? <TIcon className="w-2.5 h-2.5" /> : hasErr ? <ExclamationTriangleIcon className="w-2.5 h-2.5" /> : <TIcon className="w-2.5 h-2.5" />}
																{meta.label}
																{tc.state === "done" && !hasErr && <CheckIcon className="w-2 h-2 text-emerald-500/70" />}
															</button>
															);
														})}
													</div>
												</div>
											)}
										</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						);
					})}
					<div ref={sidebarEndRef} />
				</div>
			</div>

			<AnimatePresence>
				{selectedTool && <ToolCallDialog tool={selectedTool} onClose={() => setSelectedTool(null)} />}
			</AnimatePresence>
		</>
	);
}

/* ─── Approval card ─────────────────────────────────────────── */

function ApprovalCard({
	url,
	userCode,
	onApprove,
	isApproved,
}: {
	url: string;
	userCode?: string;
	onApprove: () => void;
	isApproved: boolean;
}) {
	if (isApproved) {
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.97 }}
				animate={{ opacity: 1, scale: 1 }}
				className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2.5 sm:py-3 bg-emerald-500/5 border border-emerald-500/20"
			>
				<div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
					<CheckIcon className="w-3 h-3 text-emerald-500" />
				</div>
				<span className="text-[13px] text-emerald-600 dark:text-emerald-400 font-medium">
					Access approved
				</span>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			className="border border-foreground/12 bg-foreground/2 overflow-hidden"
		>
			<div className="px-3 sm:px-4 py-2.5 sm:py-3 space-y-2.5 sm:space-y-3">
				<div className="flex items-start gap-2.5 sm:gap-3">
					<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 mt-0.5">
						<LockClosedIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground/40" />
					</div>
					<div className="min-w-0">
						<p className="text-[13px] font-medium text-foreground/70 mb-0.5">
							Approval required
						</p>
						<p className="text-[12px] sm:text-[12.5px] text-foreground/40 leading-relaxed">
							Sign in and grant the agent access to act on your behalf.
						</p>
					</div>
				</div>
				{userCode && (
					<div className="flex items-center gap-2.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-foreground/3 border border-foreground/6">
						<span className="text-[10px] font-mono uppercase tracking-[0.12em] text-foreground/35">
							Code
						</span>
						<span className="text-[15px] font-mono font-semibold tracking-[0.2em] text-foreground/75">
							{userCode}
						</span>
					</div>
				)}
				<button
					type="button"
					onClick={() => {
						window.open(url, "_blank");
						onApprove();
					}}
					className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary text-primary-foreground text-[13px] font-medium transition-all hover:bg-primary/90 cursor-pointer"
				>
					<LockClosedIcon className="w-3.5 h-3.5" />
					Approve Access
					<ExternalLinkIcon className="w-3 h-3 opacity-50" />
				</button>
			</div>
		</motion.div>
	);
}

/* ─── Escalation card (CIBA async approval) ────────────────── */

function EscalationCard({ dashboardUrl }: { dashboardUrl: string }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			className="border border-foreground/12 bg-foreground/2 overflow-hidden"
		>
			<div className="px-3 sm:px-4 py-2.5 sm:py-3 space-y-2.5 sm:space-y-3">
				<div className="flex items-start gap-2.5 sm:gap-3">
					<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 mt-0.5">
						<LockClosedIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground/40" />
					</div>
					<div className="min-w-0">
						<p className="text-[13px] font-medium text-foreground/70 mb-0.5">
							New capability needs approval
						</p>
						<p className="text-[12px] sm:text-[12.5px] text-foreground/40 leading-relaxed">
							The provider sent a notification to your dashboard. Visit the approvals page to grant the agent this additional permission.
						</p>
					</div>
				</div>
				<button
					type="button"
					onClick={() => window.open(dashboardUrl, "_blank")}
					className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary text-primary-foreground text-[13px] font-medium transition-all hover:bg-primary/90 cursor-pointer"
				>
					<LockClosedIcon className="w-3.5 h-3.5" />
					Open Approvals Dashboard
					<ExternalLinkIcon className="w-3 h-3 opacity-50" />
				</button>
			</div>
		</motion.div>
	);
}

/* ─── Choice card ──────────────────────────────────────────── */

interface ChoiceOption {
	value: string;
	label: string;
	description?: string;
}

function ChoiceCard({
	message,
	options,
	onChoice,
	disabled,
}: {
	message: string;
	options: ChoiceOption[];
	onChoice: (value: string, label: string) => void;
	disabled: boolean;
}) {
	const [selected, setSelected] = useState<string | null>(null);
	const isDisabled = disabled || selected !== null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			className="border border-foreground/10 bg-foreground/2 overflow-hidden"
		>
			<div className="px-3 sm:px-4 py-2.5 sm:py-3 space-y-2.5">
				{message && (
					<p className="text-[13px] text-foreground/50">{message}</p>
				)}
				<div className="flex gap-2">
					{options.map((opt) => {
						const isSelected = selected === opt.value;
						return (
							<button
								key={opt.value}
								type="button"
								disabled={isDisabled && !isSelected}
								onClick={() => {
									if (isDisabled) return;
									setSelected(opt.value);
									onChoice(opt.value, opt.label);
								}}
								className={`flex-1 flex flex-col gap-0.5 px-3 py-2.5 border text-left transition-all ${
									isSelected
										? "border-foreground/20 bg-foreground/5"
										: isDisabled
											? "border-foreground/6 opacity-30"
											: "border-foreground/10 hover:border-foreground/20 hover:bg-foreground/3 cursor-pointer"
								}`}
							>
								<span className={`text-[12px] sm:text-[13px] font-medium ${isSelected ? "text-foreground/70" : isDisabled ? "text-foreground/40" : "text-foreground/55"}`}>
									{opt.label}
								</span>
								{opt.description && (
									<span className={`text-[11px] leading-relaxed ${isSelected ? "text-foreground/40" : "text-foreground/25"}`}>
										{opt.description}
									</span>
								)}
							</button>
						);
					})}
				</div>
			</div>
		</motion.div>
	);
}

/* ─── Tool rendering ────────────────────────────────────────── */

type IconComponent = React.ComponentType<{ className?: string }>;

const TOOL_META: Record<string, { label: string; icon: IconComponent }> = {
	search: { label: "Search", icon: MagnifyingGlassIcon},
	discover_provider: { label: "Discover provider", icon: ExternalLinkIcon },
	list_capabilities: { label: "List capabilities", icon: ListBulletIcon },
	connect_agent: { label: "Connect agent", icon: TargetIcon },
	claim_agent: { label: "Claim agent", icon: LockClosedIcon },
	execute_capability: { label: "Execute", icon: PlayIcon	 },
	batch_execute_capabilities: { label: "Batch execute", icon: LayersIcon},
	agent_status: { label: "Agent status", icon: ActivityLogIcon },
	request_capability: { label: "Request capability", icon: LockClosedIcon },
	disconnect_agent: { label: "Disconnect", icon: LinkBreak2Icon },
	present_options: { label: "Ask user", icon: ListBulletIcon },
};

function ToolCallSummary({ toolName, res }: { toolName: string; res: Record<string, unknown> }) {
	if (res.status === "pending_approval" || res.error) return null;
	if (toolName === "search" && Array.isArray(res.results)) return <span className="text-[11px] text-foreground/30 font-mono">{res.results.length} result{res.results.length !== 1 ? "s" : ""}</span>;
	if (toolName === "connect_agent" && res.agentId) return <span className="text-[11px] text-foreground/30 font-mono truncate max-w-[120px]">{String(res.agentId).slice(0, 8)}…</span>;
	if (toolName === "agent_status" && res.status) return <span className={`text-[11px] font-mono ${res.status === "active" ? "text-emerald-500" : "text-foreground/30"}`}>{String(res.status)}</span>;
	return null;
}

function formatJson(value: unknown, truncate = true): string {
	try { const str = JSON.stringify(value, null, 2); return truncate && str.length > 800 ? `${str.slice(0, 800)}…` : str; }
	catch { return String(value); }
}

/* ─── Message types ─────────────────────────────────────────── */

interface ToolPart { type: string; toolName?: string; toolCallId?: string; state?: string; input?: unknown; output?: unknown; errorText?: string; }
interface MessagePart { type: string; text?: string; toolName?: string; toolCallId?: string; state?: string; input?: unknown; output?: unknown; errorText?: string; }

function isToolPart(part: MessagePart): part is ToolPart { return part.type === "dynamic-tool" || part.type.startsWith("tool-"); }
function getToolName(part: ToolPart): string { if (part.toolName) return part.toolName; if (part.type.startsWith("tool-")) return part.type.slice(5); return "unknown"; }
function getToolState(part: ToolPart): "running" | "done" | "error" { if (part.state === "output-available") return "done"; if (part.state === "output-error") return "error"; return "running"; }
function getToolResult(part: ToolPart): unknown { return part.output; }
function getToolInput(part: ToolPart): unknown { return part.input; }

/* ─── Tool calls accordion ──────────────────────────────────── */

function ToolCallsAccordion({ toolParts }: { toolParts: ToolPart[] }) {
	const [expanded, setExpanded] = useState(false);
	if (toolParts.length === 0) return null;
	const runningCount = toolParts.filter((p) => getToolState(p) === "running").length;
	const errorCount = toolParts.filter((p) => getToolState(p) === "error").length;
	return (
		<div className="my-1.5">
			<button type="button" onClick={() => setExpanded(!expanded)} className="inline-flex items-center gap-1.5 text-[11px] font-mono text-foreground/30 hover:text-foreground/50 transition-colors cursor-pointer py-0.5">
				<ChevronRightIcon className={`w-2.5 h-2.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
				<span>{toolParts.length} tool call{toolParts.length !== 1 ? "s" : ""}</span>
			{runningCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-foreground/15 tool-running shrink-0" />}
			{runningCount === 0 && errorCount === 0 && <CheckIcon className="w-2.5 h-2.5 text-emerald-500/60" />}
				{errorCount > 0 && <ExclamationTriangleIcon className="w-2.5 h-2.5 text-destructive/50" />}
			</button>
			<AnimatePresence>
				{expanded && (
					<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
						<div className="mt-1 border border-foreground/6 bg-foreground/2 divide-y divide-foreground/5 text-[11px] font-mono">
							{toolParts.map((part, i) => {
								const name = getToolName(part); const st = getToolState(part); const meta = TOOL_META[name];
								return <ToolDetailRow key={i} name={name} label={meta?.label ?? name} icon={meta?.icon ?? LightningBoltIcon} state={st} input={getToolInput(part)} output={getToolResult(part)} />;
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function ToolDetailRow({ name, label, icon: Icon, state, input, output }: { name: string; label: string; icon: IconComponent; state: "running" | "done" | "error"; input: unknown; output: unknown }) {
	const [expanded, setExpanded] = useState(false);
	const res = output as Record<string, unknown> | null | undefined;
	const hasError = state === "error" || typeof res?.error === "string";
	return (
		<div>
		<button type="button" onClick={() => state !== "running" && setExpanded(!expanded)} className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-foreground/2 transition-colors ${state === "running" ? "cursor-default tool-running" : "cursor-pointer"}`}>
			{state === "running" ? <Icon className="w-3 h-3 text-foreground/25 shrink-0" /> : hasError ? <ExclamationTriangleIcon className="w-3 h-3 text-destructive/50 shrink-0" /> : <Icon className="w-3 h-3 text-foreground/20 shrink-0" />}
				<span className="text-foreground/40 flex-1">{label}</span>
				{state === "done" && !hasError && <CheckIcon className="w-2.5 h-2.5 text-emerald-500/60" />}
				{state === "done" && res && !hasError && <ToolCallSummary toolName={name} res={res} />}
				{state !== "running" && <ChevronRightIcon className={`w-2.5 h-2.5 text-foreground/15 transition-transform ${expanded ? "rotate-90" : ""}`} />}
			</button>
			<AnimatePresence>
				{expanded && (
					<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.12 }} className="overflow-hidden">
						<div className="px-2.5 pb-2 space-y-1.5 border-t border-foreground/4 pt-1.5">
							{input != null && <div><span className="text-[9px] uppercase tracking-[0.12em] text-foreground/25 block mb-0.5">Input</span><pre className="text-foreground/35 whitespace-pre-wrap break-all leading-relaxed max-h-[100px] overflow-y-auto no-scrollbar">{formatJson(input)}</pre></div>}
							{output != null && <div><span className="text-[9px] uppercase tracking-[0.12em] text-foreground/25 block mb-0.5">Output</span><pre className="text-foreground/35 whitespace-pre-wrap break-all leading-relaxed max-h-[150px] overflow-y-auto no-scrollbar">{formatJson(output)}</pre></div>}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

/* ─── Inline tool pills ─────────────────────────────────────── */

function InlineToolPills({ toolParts }: { toolParts: ToolPart[] }) {
	if (toolParts.length === 0) return null;
	const groups: { name: string; count: number; state: "running" | "done" | "error" }[] = [];
	for (const part of toolParts) {
		const name = getToolName(part); const st = getToolState(part);
		const res = getToolResult(part) as Record<string, unknown> | null;
		if (typeof res?.approvalUrl === "string") continue;
		const existing = groups.find((g) => g.name === name);
		if (existing) { existing.count++; if (st === "running") existing.state = "running"; else if (st === "error" && existing.state !== "running") existing.state = "error"; }
		else groups.push({ name, count: 1, state: st });
	}
	if (groups.length === 0) return null;
	return (
		<div className="flex flex-wrap gap-1 my-1">
			{groups.map((g) => {
				const meta = TOOL_META[g.name] ?? { label: g.name, icon: LightningBoltIcon }; const Icon = meta.icon; const hasError = g.state === "error";
				return (
				<motion.span key={g.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[11px] font-mono ${g.state === "running" ? "border-foreground/10 bg-foreground/2 text-foreground/35 tool-running" : hasError ? "border-destructive/15 bg-destructive/3 text-destructive/50" : "border-foreground/6 text-foreground/30"}`}>
					{g.state === "running" ? <Icon className="w-2.5 h-2.5" /> : hasError ? <ExclamationTriangleIcon className="w-2.5 h-2.5" /> : <Icon className="w-2.5 h-2.5" />}
						{meta.label}{g.count > 1 && <span className="text-foreground/20">×{g.count}</span>}
						{g.state === "done" && <CheckIcon className="w-2 h-2 text-emerald-500/70" />}
					</motion.span>
				);
			})}
		</div>
	);
}

/* ─── Message components ────────────────────────────────────── */

function UserMessage({ content }: { content: string }) {
	return (
		<motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
			<div className="max-w-[92%] sm:max-w-[85%] px-3 sm:px-4 py-2 sm:py-2.5 bg-foreground/5 border border-foreground/8">
				<p className="text-[13px] sm:text-[14px] text-foreground/80 leading-relaxed wrap-break-word">{content}</p>
			</div>
		</motion.div>
	);
}

function TextBlock({ text }: { text: string }) {
	return (
		<div className="text-[13px] sm:text-[14px] text-foreground/70 leading-[1.65] sm:leading-[1.7]">
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
					strong: ({ children }) => <strong className="font-medium text-foreground/85">{children}</strong>,
					em: ({ children }) => <em className="italic text-foreground/75">{children}</em>,
					h1: ({ children }) => <h1 className="text-lg font-semibold text-foreground/90 mt-4 mb-2">{children}</h1>,
					h2: ({ children }) => <h2 className="text-base font-semibold text-foreground/90 mt-3 mb-1.5">{children}</h2>,
					h3: ({ children }) => <h3 className="text-sm font-semibold text-foreground/85 mt-2 mb-1">{children}</h3>,
					code: ({ children, className }) => {
						if (className?.startsWith("language-")) {
							return (
								<pre className="my-2 p-3 bg-foreground/3 border border-foreground/8 overflow-x-auto text-[13px] font-mono leading-relaxed">
									<code className="text-foreground/70">{String(children).trim()}</code>
								</pre>
							);
						}
						return <code className="text-[13px] font-mono px-1 py-0.5 bg-foreground/5 border border-foreground/8">{children}</code>;
					},
					pre: ({ children }) => <>{children}</>,
					ol: ({ children }) => <ol className="list-decimal ml-4 space-y-1 my-2">{children}</ol>,
					ul: ({ children }) => <ul className="list-disc ml-4 space-y-1 my-2">{children}</ul>,
					li: ({ children }) => <li className="text-foreground/65">{children}</li>,
					a: ({ href, children }) => (
						<a
							href={href}
							className="underline underline-offset-2 text-foreground/80 hover:text-foreground transition-colors"
							target={href?.startsWith("http") ? "_blank" : undefined}
							rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
						>
							{children}
						</a>
					),
					blockquote: ({ children }) => (
						<blockquote className="border-l-2 border-foreground/15 pl-3 my-2 text-foreground/50 italic">
							{children}
						</blockquote>
					),
					hr: () => <hr className="my-3 border-foreground/10" />,
					table: ({ children }) => (
						<div className="overflow-x-auto my-2">
							<table className="w-full text-[13px] border-collapse">{children}</table>
						</div>
					),
					thead: ({ children }) => <thead className="border-b border-foreground/12">{children}</thead>,
					th: ({ children }) => <th className="text-left py-1.5 px-2 text-foreground/60 font-medium text-[12px]">{children}</th>,
					td: ({ children }) => <td className="py-1.5 px-2 border-b border-foreground/6 text-foreground/55">{children}</td>,
					del: ({ children }) => <del className="text-foreground/40">{children}</del>,
					img: ({ src, alt }) => (
						<img src={src} alt={alt ?? ""} className="max-w-full my-2 border border-foreground/8" />
					),
				}}
			>
				{text}
			</ReactMarkdown>
		</div>
	);
}

function AssistantMessage({ parts, onApprove, isApproved, onChoice, choiceDisabled }: { parts: MessagePart[]; onApprove: () => void; isApproved: boolean; onChoice: (value: string, label: string) => void; choiceDisabled: boolean }) {
	const allToolParts: ToolPart[] = [];
	for (const part of parts) if (isToolPart(part) && getToolName(part) !== "present_options") allToolParts.push(part);
	const allDone = allToolParts.length > 0 && allToolParts.every((p) => getToolState(p) !== "running");

	type Segment = { kind: "text"; text: string; idx: number } | { kind: "tools"; tools: ToolPart[]; idx: number } | { kind: "approval"; part: ToolPart; idx: number } | { kind: "choice"; part: ToolPart; idx: number } | { kind: "escalation"; dashboardUrl: string; idx: number };
	const segments: Segment[] = [];
	let currentToolBatch: ToolPart[] | null = null;
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		if (isToolPart(part)) {
			const res = getToolResult(part) as Record<string, unknown> | null;
			if (getToolState(part) === "done" && typeof res?.approvalUrl === "string") {
				if (currentToolBatch) { segments.push({ kind: "tools", tools: currentToolBatch, idx: i - 1 }); currentToolBatch = null; }
				segments.push({ kind: "approval", part, idx: i });
			} else if (getToolName(part) === "request_capability" && getToolState(part) === "done" && typeof res?.status === "string" && res.status.includes("pending") && !res.approvalUrl) {
				if (currentToolBatch) { segments.push({ kind: "tools", tools: currentToolBatch, idx: i - 1 }); currentToolBatch = null; }
				const dashboardUrl = typeof res.dashboardUrl === "string" ? res.dashboardUrl : "";
				segments.push({ kind: "escalation", dashboardUrl, idx: i });
			} else if (getToolName(part) === "present_options" && getToolState(part) === "done") {
				if (currentToolBatch) { segments.push({ kind: "tools", tools: currentToolBatch, idx: i - 1 }); currentToolBatch = null; }
				segments.push({ kind: "choice", part, idx: i });
			} else { if (!currentToolBatch) currentToolBatch = []; currentToolBatch.push(part); }
		} else {
			if (currentToolBatch) { segments.push({ kind: "tools", tools: currentToolBatch, idx: i - 1 }); currentToolBatch = null; }
			const mp = part as MessagePart;
			if (mp.type === "text" && mp.text) segments.push({ kind: "text", text: mp.text, idx: i });
		}
	}
	if (currentToolBatch) segments.push({ kind: "tools", tools: currentToolBatch, idx: parts.length });

	return (
		<motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="max-w-full sm:max-w-[90%] space-y-1">
			{segments.map((seg) => {
				if (seg.kind === "text") return <TextBlock key={`t-${seg.idx}`} text={seg.text} />;
				if (seg.kind === "tools") return <InlineToolPills key={`tl-${seg.idx}`} toolParts={seg.tools} />;
				if (seg.kind === "approval") return (
					<motion.div key={`a-${seg.idx}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="my-2">
						<ApprovalCard url={(getToolResult(seg.part) as Record<string, unknown>).approvalUrl as string} userCode={(getToolResult(seg.part) as Record<string, unknown>).userCode as string | undefined} onApprove={onApprove} isApproved={isApproved} />
					</motion.div>
				);
				if (seg.kind === "escalation") return (
					<motion.div key={`e-${seg.idx}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="my-2">
						<EscalationCard dashboardUrl={seg.dashboardUrl} />
					</motion.div>
				);
				if (seg.kind === "choice") {
					const res = getToolResult(seg.part) as { message?: string; options?: ChoiceOption[] } | null;
					return (
						<motion.div key={`c-${seg.idx}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="my-2">
							<ChoiceCard message={res?.message ?? ""} options={res?.options ?? []} onChoice={onChoice} disabled={choiceDisabled} />
						</motion.div>
					);
				}
				return null;
			})}
			{allDone && allToolParts.length > 0 && <ToolCallsAccordion toolParts={allToolParts} />}
		</motion.div>
	);
}

function StreamingIndicator({ messages }: { messages: Array<{ role: string; parts: unknown }> }) {
	const lastMsg = messages[messages.length - 1];
	if (lastMsg?.role !== "assistant") return <div className="flex items-center gap-1.5 px-1 py-2"><span className="chat-dot" style={{ animationDelay: "0ms" }} /><span className="chat-dot" style={{ animationDelay: "200ms" }} /><span className="chat-dot" style={{ animationDelay: "400ms" }} /></div>;
	let hasRunningTool = false; let hasText = false;
	for (const part of lastMsg.parts as MessagePart[]) {
		if (isToolPart(part) && getToolState(part) === "running") hasRunningTool = true;
		if (part.type === "text" && part.text) hasText = true;
	}
	if (hasText || hasRunningTool) return null;
	return <div className="flex items-center gap-1.5 px-1 py-2"><span className="chat-dot" style={{ animationDelay: "0ms" }} /><span className="chat-dot" style={{ animationDelay: "200ms" }} /><span className="chat-dot" style={{ animationDelay: "400ms" }} /></div>;
}

/* ─── Helpers ───────────────────────────────────────────────── */

function getTextFromParts(msg: { content?: string; parts?: Array<{ type: string; text?: string }> }): string {
	if (msg.parts?.length) return msg.parts.filter((p) => p.type === "text" && p.text).map((p) => p.text).join("");
	return msg.content ?? "";
}

function extractUrls(text: string): string[] { return text.match(/https?:\/\/[^\s)"']+/g) ?? []; }

interface DiscoveredProvider {
	name: string;
	url: string;
}

interface AgentConnection {
	agentId: string;
	providerUrl: string;
	mode: "delegated" | "autonomous";
}

interface PhaseToolCall {
	toolName: string;
	state: "running" | "done" | "error";
	input: unknown;
	output: unknown;
}

interface PhaseData {
	active: Set<string>;
	completed: Set<string>;
	discoveredProviders: DiscoveredProvider[];
	agentConnections: AgentConnection[];
	toolsByPhase: Record<string, PhaseToolCall[]>;
}

function derivePhases(messages: Array<{ role: string; parts: unknown }>): PhaseData {
	const active = new Set<string>();
	const completed = new Set<string>();
	const discoveredProviders: DiscoveredProvider[] = [];
	const agentConnections: AgentConnection[] = [];
	const seenAgentIds = new Set<string>();
	const connectProviderUrls: string[] = [];
	const seenProviderUrls = new Set<string>();
	const toolsByPhase: Record<string, PhaseToolCall[]> = {};

	function addToolToPhase(phase: string, tc: PhaseToolCall) {
		if (!toolsByPhase[phase]) toolsByPhase[phase] = [];
		toolsByPhase[phase].push(tc);
	}

	function extractProviderUrl(input: unknown): string {
		const inp = input as Record<string, unknown> | null;
		return String(inp?.provider_url ?? inp?.providerUrl ?? inp?.provider ?? "");
	}

	function trackAgentId(agentId: string, providerUrl: string, mode: "delegated" | "autonomous") {
		if (seenAgentIds.has(agentId)) return;
		seenAgentIds.add(agentId);
		agentConnections.push({ agentId, providerUrl, mode });
	}

	for (const msg of messages) {
		if (msg.role !== "assistant") continue;
		for (const part of msg.parts as MessagePart[]) {
			if (!isToolPart(part)) continue;
			const name = getToolName(part);
			const state = getToolState(part);
			const res = getToolResult(part) as Record<string, unknown> | null;
			const tc: PhaseToolCall = { toolName: name, state, input: getToolInput(part), output: getToolResult(part) };

			if (name === "search" || name === "discover_provider" || name === "list_capabilities") {
				addToolToPhase("discovery", tc);
				if (state === "running") active.add("discovery");
				else if (state === "done") {
					completed.add("discovery"); active.delete("discovery");
					if (name === "search" && Array.isArray(res?.results)) {
						for (const r of res.results as Array<Record<string, unknown>>) {
							const url = (r.issuer ?? r.url ?? r.provider_url ?? "") as string;
							const pName = (r.provider_name ?? r.name ?? url) as string;
							if (url && !seenProviderUrls.has(url)) {
								seenProviderUrls.add(url);
								discoveredProviders.push({ name: pName, url });
							}
						}
					}
				}
			}

			if (name === "connect_agent") {
				const connProviderUrl = extractProviderUrl(getToolInput(part));
				if (connProviderUrl) connectProviderUrls.push(connProviderUrl);
				if (state === "running") {
					active.add("registration");
					addToolToPhase("registration", tc);
				} else if (state === "done") {
					if (typeof res?.approvalUrl === "string" || res?.status === "pending_approval") {
						completed.add("registration");
						active.add("consent");
						addToolToPhase("registration", tc);
						addToolToPhase("consent", tc);
						if (res?.agentId) trackAgentId(String(res.agentId), connProviderUrl, "delegated");
					} else if (res?.agentId) {
						completed.add("autonomous");
						addToolToPhase("autonomous", tc);
						trackAgentId(String(res.agentId), connProviderUrl, "autonomous");
					}
					active.delete("registration");
				}
			}

			if (name === "agent_status") {
				if (state === "done" && res?.status === "active") {
					completed.add("consent");
					active.delete("consent");
				}
				addToolToPhase("consent", tc);
			}

			if (name === "execute_capability" || name === "batch_execute_capabilities") {
				if (active.has("consent")) { completed.add("consent"); active.delete("consent"); }
				if (active.has("async_auth") && state === "done") { completed.add("async_auth"); active.delete("async_auth"); }
				addToolToPhase("execution", tc);
				if (state === "running") active.add("execution");
				else if (state === "done") { completed.add("execution"); active.delete("execution"); }
				const execInput = getToolInput(part) as Record<string, unknown> | null;
				if (execInput?.agent_id && typeof execInput.agent_id === "string" && !seenAgentIds.has(execInput.agent_id)) {
					const fallbackUrl = connectProviderUrls.find((u) =>
						!agentConnections.some((c) => c.providerUrl === u)
					) ?? "";
					trackAgentId(execInput.agent_id, fallbackUrl, "delegated");
				}
			}

			if (name === "request_capability") {
				addToolToPhase("escalation", tc);
				if (state === "running") active.add("escalation");
				else if (state === "done") {
					completed.add("escalation"); active.delete("escalation");
				}
			}

			if (name === "claim_agent") {
				addToolToPhase("claim", tc);
				if (state === "running") active.add("claim");
				else if (state === "done") { completed.add("claim"); active.delete("claim"); }
			}
		}
	}

	return { active, completed, discoveredProviders, agentConnections, toolsByPhase };
}

/* ─── Welcome dialog ─────────────────────────────────────────── */

function WelcomeDialog({ onClose }: { onClose: () => void }) {
	return (
		<div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center sm:p-4">
			<div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
			<motion.div
				initial={{ opacity: 0, y: 12, scale: 0.97 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.2 }}
				className="relative w-full sm:max-w-lg border border-foreground/10 bg-background shadow-xl shadow-foreground/5 z-10 max-h-[85dvh] overflow-y-auto"
			>
				<div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 space-y-3 sm:space-y-4">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 flex items-center justify-center bg-foreground/5 border border-foreground/8 shrink-0">
							<LightningBoltIcon className="w-4 h-4 text-foreground/50" />
						</div>
						<h2 className="text-[16px] sm:text-[17px] font-semibold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display), serif" }}>
							Before you start
						</h2>
					</div>

					<div className="text-[13px] sm:text-[14px] text-foreground/55 leading-[1.7] sm:leading-[1.75] space-y-3" style={{ fontFamily: "var(--font-content), Georgia, serif" }}>
						<p>
							This demo connects to the <strong className="text-foreground/75">Agent Auth Directory</strong> — our official provider registry. It currently has two providers:
						</p>
						<div className="space-y-2">
							<div className="flex items-start gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 border border-foreground/6 bg-foreground/2">
								<EnvelopeClosedIcon className="w-4 h-4 text-foreground/30 mt-0.5 shrink-0" />
								<div className="min-w-0">
									<p className="text-[13px] font-medium text-foreground/70">Gmail Proxy</p>
									<p className="text-[12px] sm:text-[12.5px] text-foreground/40 wrap-break-word">
										<a href="https://gmail.agent-auth.directory" target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-foreground/60 transition-colors">gmail.agent-auth.directory</a>
										{" "}— a Gmail proxy built with Agent Auth Server
									</p>
								</div>
							</div>
							<div className="flex items-start gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 border border-foreground/6 bg-foreground/2">
								<ExternalLinkIcon className="w-4 h-4 text-foreground/30 mt-0.5 shrink-0" />
								<div className="min-w-0">
									<p className="text-[13px] font-medium text-foreground/70">Agent Deploy</p>
									<p className="text-[12px] sm:text-[12.5px] text-foreground/40 wrap-break-word">
										<a href="https://deploy.agent-auth.directory" target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-foreground/60 transition-colors">deploy.agent-auth.directory</a>
										{" "}— lets the agent deploy static sites autonomously
									</p>
								</div>
							</div>
						</div>

						<div className="flex items-start gap-2.5 px-2.5 sm:px-3 py-2 sm:py-2.5 border border-amber-500/15 bg-amber-500/5">
							<ExclamationTriangleIcon className="w-4 h-4 text-amber-500/70 mt-0.5 shrink-0" />
							<p className="text-[12.5px] sm:text-[13px] text-foreground/55 leading-relaxed">
								When you connect Gmail, you{"'"}ll see a Google warning about the app not being verified — that{"'"}s expected for this demo proxy. <strong className="text-foreground/75">The agent never sees your token</strong> — it{"'"}s stored only on the proxy side.
							</p>
						</div>
						<p>
							If you{"'"}d rather not connect Gmail, the agent can still do plenty with Agent Deploy alone. You can <a href="https://gmail.agent-auth.directory/dashboard/settings" target="_blank" rel="noopener" className="underline underline-offset-2 text-foreground/70 hover:text-foreground/90 transition-colors">delete your account from the proxy</a> at any time.
						</p>
					</div>
				</div>

				<div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-foreground/6 flex justify-end sticky bottom-0 bg-background">
					<button
						type="button"
						onClick={onClose}
						className="px-5 py-2 bg-foreground text-background text-[13px] font-medium hover:bg-foreground/90 transition-colors cursor-pointer"
					>
						Got it
					</button>
				</div>
			</motion.div>
		</div>
	);
}

/* ─── Try with your tools dialog ─────────────────────────────── */

function OpenAIIcon({ className }: { className?: string }) {
	return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M20.562 10.188c.25-.688.313-1.376.25-2.063c-.062-.687-.312-1.375-.625-2c-.562-.937-1.375-1.687-2.312-2.125c-1-.437-2.063-.562-3.125-.312c-.5-.5-1.063-.938-1.688-1.25S11.687 2 11 2a5.17 5.17 0 0 0-3 .938c-.875.624-1.5 1.5-1.813 2.5c-.75.187-1.375.5-2 .875c-.562.437-1 1-1.375 1.562c-.562.938-.75 2-.625 3.063a5.44 5.44 0 0 0 1.25 2.874a4.7 4.7 0 0 0-.25 2.063c.063.688.313 1.375.625 2c.563.938 1.375 1.688 2.313 2.125c1 .438 2.062.563 3.125.313c.5.5 1.062.937 1.687 1.25S12.312 22 13 22a5.17 5.17 0 0 0 3-.937c.875-.625 1.5-1.5 1.812-2.5a4.54 4.54 0 0 0 1.938-.875c.562-.438 1.062-.938 1.375-1.563c.562-.937.75-2 .625-3.062c-.125-1.063-.5-2.063-1.188-2.876m-7.5 10.5c-1 0-1.75-.313-2.437-.875c0 0 .062-.063.125-.063l4-2.312a.5.5 0 0 0 .25-.25a.57.57 0 0 0 .062-.313V11.25l1.688 1v4.625a3.685 3.685 0 0 1-3.688 3.813M5 17.25c-.438-.75-.625-1.625-.438-2.5c0 0 .063.063.125.063l4 2.312a.56.56 0 0 0 .313.063c.125 0 .25 0 .312-.063l4.875-2.812v1.937l-4.062 2.375A3.7 3.7 0 0 1 7.312 19c-1-.25-1.812-.875-2.312-1.75M3.937 8.563a3.8 3.8 0 0 1 1.938-1.626v4.751c0 .124 0 .25.062.312a.5.5 0 0 0 .25.25l4.875 2.813l-1.687 1l-4-2.313a3.7 3.7 0 0 1-1.75-2.25c-.25-.937-.188-2.062.312-2.937M17.75 11.75l-4.875-2.812l1.687-1l4 2.312c.625.375 1.125.875 1.438 1.5s.5 1.313.437 2.063a3.7 3.7 0 0 1-.75 1.937c-.437.563-1 1-1.687 1.25v-4.75c0-.125 0-.25-.063-.312c0 0-.062-.126-.187-.188m1.687-2.5s-.062-.062-.125-.062l-4-2.313c-.125-.062-.187-.062-.312-.062s-.25 0-.313.062L9.812 9.688V7.75l4.063-2.375c.625-.375 1.312-.5 2.062-.5c.688 0 1.375.25 2 .688c.563.437 1.063 1 1.313 1.625s.312 1.375.187 2.062m-10.5 3.5l-1.687-1V7.063c0-.688.187-1.438.562-2C8.187 4.438 8.75 4 9.375 3.688a3.37 3.37 0 0 1 2.062-.313c.688.063 1.375.375 1.938.813c0 0-.063.062-.125.062l-4 2.313a.5.5 0 0 0-.25.25c-.063.125-.063.187-.063.312zm.875-2L12 9.5l2.187 1.25v2.5L12 14.5l-2.188-1.25z"/></svg>;
}
function ClaudeIcon({ className }: { className?: string }) {
	return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}><path fill="currentColor" d="m5.92 15.3l3.94-2.2l.06-.2l-.06-.1h-.2L9 12.76l-2.24-.06l-1.96-.1l-1.9-.1l-.48-.1l-.42-.6l.04-.3l.4-.26l.58.04l1.26.1l1.9.12l1.38.08l2.04.24h.32l.04-.14l-.1-.08l-.08-.08L7.8 10.2L5.68 8.8l-1.12-.82l-.6-.4l-.3-.4l-.12-.84l.54-.6l.74.06l.18.04l.74.58l1.6 1.22L9.4 9.2l.3.24l.12-.08l.02-.06l-.14-.22L8.6 7L7.4 4.92l-.54-.86l-.14-.52c-.06-.2-.08-.4-.08-.6l.6-.84l.36-.1l.84.12l.32.28l.52 1.2l.82 1.86l1.3 2.52l.4.76l.2.68l.06.2h.14v-.1l.1-1.44l.2-1.74l.2-2.24l.06-.64l.32-.76l.6-.4l.52.22l.4.58l-.06.36L14.32 5l-.52 2.42l-.3 1.64h.18l.2-.22l.82-1.08l1.38-1.72l.6-.7l.72-.74l.46-.36h.86l.62.94l-.28.98l-.88 1.12l-.74.94l-1.06 1.42l-.64 1.14l.06.08h.14l2.4-.52l1.28-.22l1.52-.26l.7.32l.08.32l-.28.68l-1.64.4l-1.92.4l-2.86.66l-.04.02l.04.06l1.28.12l.56.04h1.36l2.52.2l.66.4l.38.54l-.06.4l-1.02.52l-1.36-.32l-3.2-.76l-1.08-.26h-.16v.08l.92.9l1.66 1.5l2.12 1.94l.1.48l-.26.4l-.28-.04l-1.84-1.4l-.72-.6l-1.6-1.36h-.1v.14l.36.54l1.96 2.94l.1.9l-.14.28l-.52.2l-.54-.12l-1.16-1.6l-1.2-1.8l-.94-1.64l-.1.08l-.58 6.04l-.26.3l-.6.24l-.5-.4l-.28-.6l.28-1.24l.32-1.6l.26-1.28l.24-1.58l.14-.52v-.04h-.14l-1.2 1.66l-1.8 2.46l-1.44 1.52l-.34.14l-.6-.3l.06-.56l.32-.46l2-2.56l1.2-1.58l.8-.92l-.02-.1h-.06l-5.28 3.44l-.94.12l-.4-.4l.04-.6l.2-.2l1.6-1.1z"/></svg>;
}
function VercelIcon({ className }: { className?: string }) {
	return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}><path fill="currentColor" d="m12 1.608l12 20.784H0Z"/></svg>;
}
function CursorIcon({ className }: { className?: string }) {
	return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M11.503.131L1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"/></svg>;
}
function OpenCodeIcon({ className }: { className?: string }) {
	return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" className={className}><path d="M24 32H8V16H24V32Z" fill="currentColor" opacity="0.4"/><path d="M24 8H8V32H24V8ZM32 40H0V0H32V40Z" fill="currentColor"/></svg>;
}

const TOOL_INTEGRATIONS: { name: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
	{ name: "ChatGPT", icon: OpenAIIcon, description: "Use with ChatGPT actions and plugins" },
	{ name: "Codex", icon: OpenAIIcon, description: "Integrate with the OpenAI Codex CLI" },
	{ name: "Claude Desktop", icon: ClaudeIcon, description: "Connect as a Claude Desktop MCP tool" },
	{ name: "Claude Web", icon: ClaudeIcon, description: "Use with Claude on the web" },
	{ name: "Claude Code", icon: ClaudeIcon, description: "Add to your Claude Code workflow" },
	{ name: "Cursor", icon: CursorIcon, description: "Add Agent Auth to your Cursor AI agent" },
	{ name: "OpenCode", icon: OpenCodeIcon, description: "Use with the OpenCode terminal agent" },
	{ name: "Vercel AI SDK", icon: VercelIcon, description: "Add to your Vercel AI SDK project" },
];

function TryWithToolsDialog({ onClose }: { onClose: () => void }) {
	return (
		<div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center sm:p-4">
			<div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
			<motion.div
				initial={{ opacity: 0, y: 12, scale: 0.97 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.2 }}
				className="relative w-full sm:max-w-lg border border-foreground/10 bg-background shadow-xl shadow-foreground/5 z-10 max-h-[85dvh] overflow-y-auto"
			>
				<div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 space-y-3 sm:space-y-4">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 flex items-center justify-center bg-foreground/5 border border-foreground/8 shrink-0">
							<LightningBoltIcon className="w-4 h-4 text-foreground/50" />
						</div>
						<div className="flex-1 min-w-0">
							<h2 className="text-[16px] sm:text-[17px] font-semibold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display), serif" }}>
								Try with your favourite tools
							</h2>
						</div>
						<button type="button" onClick={onClose} className="p-1.5 text-foreground/30 hover:text-foreground/60 transition-colors cursor-pointer">
							<Cross2Icon className="w-4 h-4" />
						</button>
					</div>

					<p className="text-[13px] sm:text-[14px] text-foreground/45 leading-relaxed" style={{ fontFamily: "var(--font-content), Georgia, serif" }}>
						Agent Auth works with any AI tool that supports tool calling. Pick your stack and get started in minutes.
					</p>

					<div className="space-y-1.5">
						{TOOL_INTEGRATIONS.map((tool) => {
							const ToolIcon = tool.icon;
							return (
								<div
									key={tool.name}
									className="flex items-center gap-3 px-3 py-2.5 border border-foreground/6 bg-foreground/2"
								>
									<span className="w-8 h-8 flex items-center justify-center bg-foreground/5 border border-foreground/8 text-foreground/40 shrink-0">
										<ToolIcon className="w-4 h-4" />
									</span>
									<div className="flex-1 min-w-0">
										<p className="text-[13px] font-medium text-foreground/70">{tool.name}</p>
										<p className="text-[12px] text-foreground/35 truncate">{tool.description}</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-foreground/6 sticky bottom-0 bg-background">
					<p className="text-[12px] text-foreground/30 leading-relaxed" style={{ fontFamily: "var(--font-content), Georgia, serif" }}>
						All integrations use the same <a href="/docs" className="underline underline-offset-2 hover:text-foreground/50 transition-colors">Agent Auth SDK</a> under the hood.
					</p>
				</div>
			</motion.div>
		</div>
	);
}

/* ─── Main component ────────────────────────────────────────── */

export function InteractiveDemo() {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const userScrolledRef = useRef(false);
	const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const escalationPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const escalationGrantCountRef = useRef<number | null>(null);
	const seenEscalationIdsRef = useRef(new Set<number>());

	const [showWelcome, setShowWelcome] = useState(false);
	const [showToolsDialog, setShowToolsDialog] = useState(false);
	useEffect(() => {
		if (!sessionStorage.getItem("demo-welcome-dismissed")) setShowWelcome(true);
	}, []);
	const [input, setInput] = useState("");
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [wtPromptIdx, setWtPromptIdx] = useState(0);
	const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
	const [awaitingApproval, setAwaitingApproval] = useState(false);
	const [approvedCount, setApprovedCount] = useState(0);
	const seenApprovalUrlsRef = useRef(new Set<string>());

	const [sessionId] = useState(() => typeof crypto !== "undefined" ? crypto.randomUUID() : "fallback");
	const [transport] = useState(() => new DefaultChatTransport({ api: "/api/demo/chat", body: { sessionId } }));
	const { messages, status, sendMessage, stop } = useChat({ id: "demo", transport });

	const isStreaming = status === "streaming" || status === "submitted";
	const isGuided = wtPromptIdx < WALKTHROUGH_PROMPTS.length;
	const isComplete = wtPromptIdx >= WALKTHROUGH_PROMPTS.length;

	const { active: activePhases, completed: completedPhases, discoveredProviders, toolsByPhase } = derivePhases(messages);

	const stepComplete = wtPromptIdx === 0 || (wtPromptIdx === 1 && (capturedUrl !== null || completedPhases.has("execution"))) || wtPromptIdx >= 2;
	const currentPrompt = isGuided && !isStreaming && !awaitingApproval && stepComplete
		? (WALKTHROUGH_PROMPTS[wtPromptIdx].prompt ?? (WALKTHROUGH_PROMPTS[wtPromptIdx].promptTemplate ?? ""))
		: null;
	const isFirstPrompt = wtPromptIdx === 0 && messages.length === 0;

	const handleChoice = useCallback((value: string, label: string) => {
		sendMessage({ text: label });
	}, [sendMessage]);

	useEffect(() => {
		if (isFirstPrompt && currentPrompt) setInput(currentPrompt);
	}, [isFirstPrompt, currentPrompt]);

	const sendSuggestion = useCallback(() => {
		if (!currentPrompt || isStreaming) return;
		setWtPromptIdx((prev) => prev + 1);
		sendMessage({ text: currentPrompt });
	}, [currentPrompt, isStreaming, sendMessage]);

	// Capture deploy URL from messages whenever streaming finishes
	const prevStreamingRef = useRef(false);
	const KNOWN_HOSTS = new Set(["gmail.agent-auth.directory", "deploy.agent-auth.directory", "agent-auth.directory", "localhost"]);
	const isDeployUrl = (u: string) => {
		try { const h = new URL(u).hostname; return !KNOWN_HOSTS.has(h) && !h.endsWith("google.com"); }
		catch { return false; }
	};
	useEffect(() => {
		if (prevStreamingRef.current && !isStreaming && !capturedUrl) {
			for (let i = messages.length - 1; i >= 0; i--) {
				if (messages[i].role !== "assistant") continue;
				const parts = messages[i].parts as MessagePart[];
				for (const part of parts) {
					if (isToolPart(part) && (getToolName(part) === "execute_capability" || getToolName(part) === "batch_execute_capabilities") && getToolState(part) === "done") {
						const output = getToolResult(part) as Record<string, unknown> | null;
						if (output && !output.error) {
							const urls = extractUrls(JSON.stringify(output));
							const url = urls.find(isDeployUrl);
							if (url) { setCapturedUrl(url); prevStreamingRef.current = isStreaming; return; }
						}
					}
				}
				const text = getTextFromParts(messages[i]);
				const urls = extractUrls(text);
				const deployUrl = urls.find(isDeployUrl);
				if (deployUrl) { setCapturedUrl(deployUrl); break; }
			}
		}
		prevStreamingRef.current = isStreaming;
	}, [isStreaming, capturedUrl, messages]);

	// Auto-scroll
	useEffect(() => {
		if (!userScrolledRef.current) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, isStreaming]);

	const handleScroll = useCallback(() => {
		const el = scrollContainerRef.current;
		if (!el) return;
		userScrolledRef.current = el.scrollHeight - el.scrollTop - el.clientHeight > 80;
	}, []);

	// Approval polling
	const sendMessageRef = useRef(sendMessage);
	sendMessageRef.current = sendMessage;
	const isStreamingRef = useRef(isStreaming);
	isStreamingRef.current = isStreaming;

	const startPolling = useCallback(() => {
		if (pollingRef.current) return;
		setAwaitingApproval(true);
		pollingRef.current = setInterval(async () => {
			try {
				const res = await fetch(`/api/demo/status?sessionId=${sessionId}`);
				const data = await res.json();
				if (data.status === "active") {
					if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
					setAwaitingApproval(false);
					setApprovedCount((c) => c + 1);
					const waitForIdle = () => {
						if (!isStreamingRef.current) sendMessageRef.current({ text: "I've approved the connection. Please continue with my request." });
						else setTimeout(waitForIdle, 500);
					};
					setTimeout(waitForIdle, 600);
				}
			} catch { /* retry */ }
		}, 2000);
	}, [sessionId]);

	// Detect new approval URLs in messages and start polling
	useEffect(() => {
		for (const msg of messages) {
			if (msg.role !== "assistant") continue;
			for (const part of msg.parts as MessagePart[]) {
				if (!isToolPart(part) || getToolState(part) !== "done") continue;
				const res = getToolResult(part) as Record<string, unknown> | null;
				if (typeof res?.approvalUrl === "string" && !seenApprovalUrlsRef.current.has(res.approvalUrl)) {
					seenApprovalUrlsRef.current.add(res.approvalUrl);
					if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
					startPolling();
					return;
				}
			}
		}
	}, [messages, startPolling]);

	const startEscalationPolling = useCallback(() => {
		if (escalationPollingRef.current) return;
		setAwaitingApproval(true);
		const fetchInitialGrants = async () => {
			try {
				const res = await fetch(`/api/demo/status?sessionId=${sessionId}`);
				const data = await res.json();
				escalationGrantCountRef.current = Array.isArray(data.grants) ? data.grants.length : 0;
			} catch {
				escalationGrantCountRef.current = 0;
			}
		};
		fetchInitialGrants().then(() => {
			escalationPollingRef.current = setInterval(async () => {
				try {
					const res = await fetch(`/api/demo/status?sessionId=${sessionId}`);
					const data = await res.json();
					const currentGrants = Array.isArray(data.grants) ? data.grants.length : 0;
					if (escalationGrantCountRef.current !== null && currentGrants > escalationGrantCountRef.current) {
						if (escalationPollingRef.current) { clearInterval(escalationPollingRef.current); escalationPollingRef.current = null; }
						escalationGrantCountRef.current = null;
						setAwaitingApproval(false);
						setApprovedCount((c) => c + 1);
						const waitForIdle = () => {
							if (!isStreamingRef.current) sendMessageRef.current({ text: "Done — I've approved the new capability." });
							else setTimeout(waitForIdle, 500);
						};
						setTimeout(waitForIdle, 600);
					}
				} catch { /* retry */ }
			}, 2000);
		});
	}, [sessionId]);

	// Detect escalation (CIBA) in messages and start polling
	useEffect(() => {
		for (let mi = 0; mi < messages.length; mi++) {
			const msg = messages[mi];
			if (msg.role !== "assistant") continue;
			const parts = msg.parts as MessagePart[];
			for (let pi = 0; pi < parts.length; pi++) {
				const part = parts[pi];
				if (!isToolPart(part) || getToolState(part) !== "done") continue;
				if (getToolName(part) !== "request_capability") continue;
				const res = getToolResult(part) as Record<string, unknown> | null;
				if (typeof res?.status === "string" && res.status.includes("pending") && !res.approvalUrl) {
					const partKey = mi * 1000 + pi;
					if (!seenEscalationIdsRef.current.has(partKey)) {
						seenEscalationIdsRef.current.add(partKey);
						startEscalationPolling();
						return;
					}
				}
			}
		}
	}, [messages, startEscalationPolling]);

	useEffect(() => {
		return () => {
			if (pollingRef.current) clearInterval(pollingRef.current);
			if (escalationPollingRef.current) clearInterval(escalationPollingRef.current);
		};
	}, []);
	const handleApprove = useCallback(() => startPolling(), [startPolling]);
	const cancelPolling = useCallback(() => {
		if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
		if (escalationPollingRef.current) { clearInterval(escalationPollingRef.current); escalationPollingRef.current = null; }
		escalationGrantCountRef.current = null;
		setAwaitingApproval(false);
	}, []);

	const onSubmit = useCallback((e: FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isStreaming) return;
		if (isFirstPrompt) setWtPromptIdx((prev) => prev + 1);
		sendMessage({ text: input });
		setInput("");
	}, [input, isStreaming, isFirstPrompt, sendMessage]);

	const dismissWelcome = useCallback(() => {
		setShowWelcome(false);
		sessionStorage.setItem("demo-welcome-dismissed", "1");
	}, []);

	return (
		<div className="flex flex-col h-full">
			<AnimatePresence>
				{showWelcome && <WelcomeDialog onClose={dismissWelcome} />}
			</AnimatePresence>
			<AnimatePresence>
				{showToolsDialog && <TryWithToolsDialog onClose={() => setShowToolsDialog(false)} />}
			</AnimatePresence>

			<div className="mb-2 sm:mb-4 shrink-0 flex items-start justify-between gap-4">
				<div>
					<h1 className="text-lg sm:text-2xl tracking-[-0.02em] font-semibold" style={{ fontFamily: "var(--font-display), serif" }}>
						Try Agent Auth
					</h1>
					<p className="text-[13px] sm:text-[14px] text-foreground/40 mt-1" style={{ fontFamily: "var(--font-content), Georgia, serif" }}>
						Chat with an AI agent that discovers services, authenticates, and acts on your behalf.
					</p>
				</div>
				<button
					type="button"
					onClick={() => setShowToolsDialog(true)}
					className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-foreground/50 hover:text-foreground/80 border border-dashed border-foreground/15 hover:border-foreground/25 hover:bg-foreground/3 transition-all cursor-pointer shrink-0 mt-0.5"
				>
					<span className="flex items-center -space-x-1.5">
						<span className="w-4.5 h-4.5 rounded-full bg-background border border-foreground/10 flex items-center justify-center relative z-[4]"><OpenAIIcon className="w-2.5 h-2.5 text-foreground/70" /></span>
						<span className="w-4.5 h-4.5 rounded-full bg-background border border-foreground/10 flex items-center justify-center relative z-[3]"><ClaudeIcon className="w-2.5 h-2.5 text-[#D97757]" /></span>
						<span className="w-4.5 h-4.5 rounded-full bg-background border border-foreground/10 flex items-center justify-center relative z-[2]"><CursorIcon className="w-2.5 h-2.5 text-foreground/70" /></span>
						<span className="w-4.5 h-4.5 rounded-full bg-background border border-foreground/10 flex items-center justify-center relative z-[1]"><VercelIcon className="w-2.5 h-2.5 text-foreground/70" /></span>
					</span>
					Try with your tools
					<ArrowRightIcon className="w-3 h-3 opacity-50" />
				</button>
			</div>

			<div className="flex gap-0 border border-foreground/8 flex-1 min-h-0 bg-background relative">
				<div className="flex-1 flex flex-col min-w-0">
					{messages.length === 0 ? (
						<div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-5 gap-4 sm:gap-5">
							<div className="flex flex-col items-center gap-2.5 sm:gap-3">
								<div className="flex items-center justify-center gap-3 text-foreground opacity-20">
									<LockClosedIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
									<LightningBoltIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
									<EnvelopeClosedIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
								</div>
								<p className="text-[13px] sm:text-[14px] text-foreground/30 text-center max-w-xs leading-relaxed px-2" style={{ fontFamily: "var(--font-content), Georgia, serif" }}>
									A chatbot integrated with the Agent Auth SDK — authenticate, authorize, and act on behalf of users. Press <strong className="text-foreground/50">Send</strong> to start.
								</p>
							</div>
							<form onSubmit={onSubmit} className="w-full max-w-lg border border-foreground/8 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
								<input
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder="Type a prompt…"
									className="flex-1 bg-transparent text-[13px] sm:text-[14px] outline-none placeholder:text-foreground/25 text-foreground/80 min-w-0"
								/>
								<button type="submit" disabled={!input.trim()} className="p-1.5 sm:p-2 text-foreground/30 hover:text-foreground/60 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0">
									<PaperPlaneIcon className="w-4 h-4" />
								</button>
							</form>
						</div>
					) : (
						<>
							<ProtocolProgressBar activePhases={activePhases} completedPhases={completedPhases} onOpen={() => setSidebarOpen(true)} />
							<div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 py-3 sm:py-5 space-y-3 sm:space-y-4">
							{messages.map((msg, i) =>
								msg.role === "user" ? <UserMessage key={msg.id} content={getTextFromParts(msg)} /> : <AssistantMessage key={msg.id} parts={msg.parts as MessagePart[]} onApprove={handleApprove} isApproved={approvedCount > 0 && !awaitingApproval} onChoice={handleChoice} choiceDisabled={i !== messages.length - 1 || isStreaming} />,
							)}
								{isStreaming && <StreamingIndicator messages={messages} />}
								<div ref={messagesEndRef} />
							</div>

							<div className="border-t border-foreground/8">
							{currentPrompt && !isFirstPrompt && !isStreaming && !awaitingApproval && (
								<button
									type="button"
									onClick={sendSuggestion}
									className="w-full text-left px-3 sm:px-5 py-2.5 flex items-center gap-2 sm:gap-2.5 border-b border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors cursor-pointer group"
								>
									<LightningBoltIcon className="w-3.5 h-3.5 text-foreground/40 group-hover:text-foreground/60 shrink-0 transition-colors" />
									<span className="text-[12px] sm:text-[13px] text-foreground/55 group-hover:text-foreground/75 truncate transition-colors">
										{currentPrompt}
									</span>
									<ArrowRightIcon className="w-3.5 h-3.5 text-foreground/25 group-hover:text-foreground/50 shrink-0 ml-auto transition-colors" />
								</button>
								)}
								<form onSubmit={onSubmit} className="px-3 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
									{isStreaming ? (
										<>
										<div className="flex-1 flex items-center gap-2 min-w-0 tool-running">
											<span className="w-3.5 h-3.5 rounded-full bg-foreground/15 tool-running shrink-0" />
											<span className="text-[13px] sm:text-[14px] text-foreground/30 truncate">Agent is working…</span>
										</div>
											<button type="button" onClick={stop} className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[12px] font-mono text-foreground/50 hover:text-foreground/80 border border-foreground/10 hover:border-foreground/20 transition-colors cursor-pointer shrink-0">
												<StopIcon className="w-2.5 h-2.5 fill-current" />Stop
											</button>
										</>
									) : awaitingApproval ? (
										<>
										<div className="flex-1 flex items-center gap-2 min-w-0 tool-running">
											<LockClosedIcon className="w-3.5 h-3.5 text-foreground/25 shrink-0" />
											<span className="text-[13px] sm:text-[14px] text-foreground/30 truncate">Waiting for approval…</span>
										</div>
											<button type="button" onClick={cancelPolling} className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[12px] font-mono text-foreground/50 hover:text-foreground/80 border border-foreground/10 hover:border-foreground/20 transition-colors cursor-pointer shrink-0">
												<Cross2Icon className="w-2.5 h-2.5" />Cancel
											</button>
										</>
									) : (
										<>
											<input
												value={input}
												onChange={(e) => setInput(e.target.value)}
												placeholder={isComplete ? "Explore freely — ask anything…" : "Type something else…"}
												className="flex-1 bg-transparent text-[13px] sm:text-[14px] outline-none placeholder:text-foreground/25 text-foreground/80 min-w-0"
											/>
											<button type="submit" disabled={!input.trim()} className="p-1.5 sm:p-2 text-foreground/30 hover:text-foreground/60 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0">
												<PaperPlaneIcon className="w-4 h-4" />
											</button>
										</>
									)}
								</form>
							</div>
						</>
					)}
				</div>

				<Sidebar activePhases={activePhases} completedPhases={completedPhases} discoveredProviders={discoveredProviders} toolsByPhase={toolsByPhase} sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
			</div>

		</div>
	);
}
