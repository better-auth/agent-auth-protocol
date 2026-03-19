"use client";

import { useRef, useState, useEffect, useCallback, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "motion/react";
import {
	PaperPlaneIcon,
	UpdateIcon,
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
	{ prompt: "Summarize my most recent email in one sentence" },
	{ promptTemplate: 'Send an email to agent-auth@better-auth.com with the subject "I just tried Agent Auth!" and include the deployed URL: {{url}}' },
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
			"The agent searches the **[Agent Auth directory](/directory)** for providers that match what the user needs. Providers publish their capabilities at well-known URLs, and a central directory indexes them.",
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
			"The user approves the agent's access via a **device authorization** flow. They sign in, see what capabilities the agent is requesting, and grant or deny each one individually.",
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
					<span className={`text-[10px] font-mono uppercase tracking-[0.1em] px-1.5 py-0.5 ${hasError ? "text-destructive/60 bg-destructive/5 border border-destructive/10" : tool.state === "running" ? "text-foreground/35 bg-foreground/3 border border-foreground/8" : "text-emerald-600/70 dark:text-emerald-400/70 bg-emerald-500/5 border border-emerald-500/12"}`}>
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
						<div className="flex items-center gap-2 py-3 justify-center text-foreground/30">
							<UpdateIcon className="w-3.5 h-3.5 animate-spin" />
							<span className="text-[12px] font-mono">Running…</span>
						</div>
					)}
				</div>
			</motion.div>
		</div>
	);
}

/* ─── Sidebar ───────────────────────────────────────────────── */

const mdComponents = {
	p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
	strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-foreground/75">{children}</strong>,
	code: ({ children }: { children?: React.ReactNode }) => <code className="text-[12px] font-mono px-1 py-px bg-foreground/5 border border-foreground/8">{children}</code>,
	a: ({ href, children }: { href?: string; children?: React.ReactNode }) => <a href={href} className="underline underline-offset-2 text-foreground/75 hover:text-foreground/90 transition-colors">{children}</a>,
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
										<UpdateIcon className="w-3 h-3 animate-spin text-foreground/40" />
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
																	className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono border transition-colors cursor-pointer ${tc.state === "running" ? "border-foreground/10 bg-foreground/3 text-foreground/35 hover:bg-foreground/5" : hasErr ? "border-destructive/15 bg-destructive/3 text-destructive/50 hover:bg-destructive/6" : "border-foreground/6 bg-foreground/3 text-foreground/35 hover:bg-foreground/5 hover:text-foreground/50"}`}
																>
																	{tc.state === "running" ? <UpdateIcon className="w-2.5 h-2.5 animate-spin" /> : hasErr ? <ExclamationTriangleIcon className="w-2.5 h-2.5" /> : <TIcon className="w-2.5 h-2.5" />}
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
				{runningCount > 0 && <UpdateIcon className="w-2.5 h-2.5 animate-spin" />}
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
			<button type="button" onClick={() => state !== "running" && setExpanded(!expanded)} className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-foreground/2 transition-colors ${state !== "running" ? "cursor-pointer" : "cursor-default"}`}>
				{state === "running" ? <UpdateIcon className="w-3 h-3 animate-spin text-foreground/25 shrink-0" /> : hasError ? <ExclamationTriangleIcon className="w-3 h-3 text-destructive/50 shrink-0" /> : <Icon className="w-3 h-3 text-foreground/20 shrink-0" />}
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
					<motion.span key={g.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[11px] font-mono ${g.state === "running" ? "border-foreground/10 bg-foreground/2 text-foreground/35" : hasError ? "border-destructive/15 bg-destructive/3 text-destructive/50" : "border-foreground/6 text-foreground/30"}`}>
						{g.state === "running" ? <UpdateIcon className="w-2.5 h-2.5 animate-spin" /> : hasError ? <ExclamationTriangleIcon className="w-2.5 h-2.5" /> : <Icon className="w-2.5 h-2.5" />}
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

function AssistantMessage({ parts, onApprove, isApproved }: { parts: MessagePart[]; onApprove: () => void; isApproved: boolean }) {
	const allToolParts: ToolPart[] = [];
	for (const part of parts) if (isToolPart(part)) allToolParts.push(part);
	const allDone = allToolParts.length > 0 && allToolParts.every((p) => getToolState(p) !== "running");

	type Segment = { kind: "text"; text: string; idx: number } | { kind: "tools"; tools: ToolPart[]; idx: number } | { kind: "approval"; part: ToolPart; idx: number };
	const segments: Segment[] = [];
	let currentToolBatch: ToolPart[] | null = null;
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		if (isToolPart(part)) {
			const res = getToolResult(part) as Record<string, unknown> | null;
			if (getToolState(part) === "done" && typeof res?.approvalUrl === "string") {
				if (currentToolBatch) { segments.push({ kind: "tools", tools: currentToolBatch, idx: i - 1 }); currentToolBatch = null; }
				segments.push({ kind: "approval", part, idx: i });
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
	toolsByPhase: Record<string, PhaseToolCall[]>;
}

function derivePhases(messages: Array<{ role: string; parts: unknown }>): PhaseData {
	const active = new Set<string>();
	const completed = new Set<string>();
	const discoveredProviders: DiscoveredProvider[] = [];
	const seenProviderUrls = new Set<string>();
	const toolsByPhase: Record<string, PhaseToolCall[]> = {};

	function addToolToPhase(phase: string, tc: PhaseToolCall) {
		if (!toolsByPhase[phase]) toolsByPhase[phase] = [];
		toolsByPhase[phase].push(tc);
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
				if (state === "running") {
					active.add("registration");
					addToolToPhase("registration", tc);
				} else if (state === "done") {
					if (typeof res?.approvalUrl === "string" || res?.status === "pending_approval") {
						completed.add("registration");
						active.add("consent");
						addToolToPhase("registration", tc);
						addToolToPhase("consent", tc);
					} else if (res?.agentId) {
						completed.add("autonomous");
						addToolToPhase("autonomous", tc);
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
			}

			if (name === "request_capability") {
				addToolToPhase("escalation", tc);
				if (state === "running") active.add("escalation");
				else if (state === "done") {
					completed.add("escalation"); active.delete("escalation");
					active.add("async_auth");
					addToolToPhase("async_auth", tc);
				}
			}

			if (name === "claim_agent") {
				addToolToPhase("claim", tc);
				if (state === "running") active.add("claim");
				else if (state === "done") { completed.add("claim"); active.delete("claim"); }
			}
		}
	}

	return { active, completed, discoveredProviders, toolsByPhase };
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

						<p>
							When you connect Gmail, you{"'"}ll see a Google warning about the app not being verified — that{"'"}s expected for this demo proxy. <strong className="text-foreground/75">The agent never sees your token</strong> — it{"'"}s stored only on the proxy side.
						</p>
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

/* ─── Main component ────────────────────────────────────────── */

export function InteractiveDemo() {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const userScrolledRef = useRef(false);
	const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const [showWelcome, setShowWelcome] = useState(false);
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

	const currentPrompt = isGuided && !isStreaming && !awaitingApproval
		? (WALKTHROUGH_PROMPTS[wtPromptIdx].prompt ?? (WALKTHROUGH_PROMPTS[wtPromptIdx].promptTemplate ?? "").replace("{{url}}", capturedUrl ?? "[deploy URL]"))
		: null;
	const isFirstPrompt = wtPromptIdx === 0 && messages.length === 0;

	const escalationPending = !isStreaming && !awaitingApproval && messages.length > 0 && (() => {
		const last = messages[messages.length - 1];
		if (last.role !== "assistant") return false;
		for (const part of last.parts as MessagePart[]) {
			if (isToolPart(part) && getToolName(part) === "request_capability" && getToolState(part) === "done") return true;
		}
		return false;
	})();

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
	useEffect(() => {
		if (prevStreamingRef.current && !isStreaming && !capturedUrl) {
			for (let i = messages.length - 1; i >= 0; i--) {
				if (messages[i].role !== "assistant") continue;
				const text = getTextFromParts(messages[i]);
				const urls = extractUrls(text);
				const deployUrl = urls.find((u) => !u.includes("gmail") && !u.includes("google") && !u.includes("agent-auth") && !u.includes("localhost"));
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

	useEffect(() => { return () => { if (pollingRef.current) clearInterval(pollingRef.current); }; }, []);
	const handleApprove = useCallback(() => startPolling(), [startPolling]);
	const cancelPolling = useCallback(() => {
		if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
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

			<div className="mb-2 sm:mb-4 shrink-0">
				<h1 className="text-lg sm:text-2xl tracking-[-0.02em] font-semibold" style={{ fontFamily: "var(--font-display), serif" }}>
					Try Agent Auth
				</h1>
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
									Deploy a site, then share it via email — all through Agent Auth. Press <strong className="text-foreground/50">Send</strong> to start.
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
							<div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 py-3 sm:py-5 space-y-3 sm:space-y-4">
								{messages.map((msg) =>
									msg.role === "user" ? <UserMessage key={msg.id} content={getTextFromParts(msg)} /> : <AssistantMessage key={msg.id} parts={msg.parts as MessagePart[]} onApprove={handleApprove} isApproved={approvedCount > 0 && !awaitingApproval} />,
								)}
								{isStreaming && <StreamingIndicator messages={messages} />}
								<div ref={messagesEndRef} />
							</div>

							<div className="border-t border-foreground/8">
								{currentPrompt && !isFirstPrompt && !isStreaming && !awaitingApproval && !escalationPending && (
									<button
										type="button"
										onClick={sendSuggestion}
										className="w-full text-left px-3 sm:px-5 py-2 flex items-center gap-2 sm:gap-2.5 border-b border-dashed border-foreground/6 hover:bg-foreground/2 transition-colors cursor-pointer group"
									>
										<LightningBoltIcon className="w-3 h-3 text-foreground/20 group-hover:text-foreground/40 shrink-0 transition-colors" />
										<span className="text-[11px] sm:text-[12px] text-foreground/30 group-hover:text-foreground/55 truncate transition-colors">
											{currentPrompt}
										</span>
										<ChevronRightIcon className="w-3 h-3 text-foreground/15 group-hover:text-foreground/35 shrink-0 ml-auto transition-colors" />
									</button>
								)}
								{escalationPending && (
									<button
										type="button"
										onClick={() => { sendMessage({ text: "Done — I've approved the new capability." }); }}
										className="w-full text-left px-3 sm:px-5 py-2 flex items-center gap-2 sm:gap-2.5 border-b border-dashed border-foreground/6 hover:bg-foreground/2 transition-colors cursor-pointer group"
									>
										<CheckIcon className="w-3 h-3 text-emerald-500/50 group-hover:text-emerald-500/80 shrink-0 transition-colors" />
										<span className="text-[11px] sm:text-[12px] text-foreground/30 group-hover:text-foreground/55 transition-colors">
											Done — I{"'"}ve approved the new capability
										</span>
										<ChevronRightIcon className="w-3 h-3 text-foreground/15 group-hover:text-foreground/35 shrink-0 ml-auto transition-colors" />
									</button>
								)}
								<form onSubmit={onSubmit} className="px-3 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
									{isStreaming ? (
										<>
											<div className="flex-1 flex items-center gap-2 min-w-0">
												<UpdateIcon className="w-3.5 h-3.5 animate-spin text-foreground/30 shrink-0" />
												<span className="text-[13px] sm:text-[14px] text-foreground/30 truncate">Agent is working…</span>
											</div>
											<button type="button" onClick={stop} className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[12px] font-mono text-foreground/50 hover:text-foreground/80 border border-foreground/10 hover:border-foreground/20 transition-colors cursor-pointer shrink-0">
												<StopIcon className="w-2.5 h-2.5 fill-current" />Stop
											</button>
										</>
									) : awaitingApproval ? (
										<>
											<div className="flex-1 flex items-center gap-2 min-w-0">
												<LockClosedIcon className="w-3.5 h-3.5 text-foreground/25 shrink-0" />
												<span className="text-[13px] sm:text-[14px] text-foreground/30 truncate">Waiting for approval…</span>
												<UpdateIcon className="w-3 h-3 animate-spin text-foreground/20 shrink-0" />
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

				<button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden absolute top-2 right-2 z-30 p-1.5 text-foreground/30 hover:text-foreground/60 border border-foreground/10 bg-background cursor-pointer">
					<ReaderIcon className="w-3.5 h-3.5" />
				</button>

				<Sidebar activePhases={activePhases} completedPhases={completedPhases} discoveredProviders={discoveredProviders} toolsByPhase={toolsByPhase} sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
			</div>

		</div>
	);
}
