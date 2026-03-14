"use client";

import {
	ArrowRight,
	Bot,
	Check,
	Clock,
	Eye,
	Fingerprint,
	KeyRound,
	Lock,
	Server,
	Settings2,
	Shield,
	ShieldAlert,
	Users,
	X,
	Zap,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { highlight } from "sugar-high";
import type { ProductView } from "@/components/landing/landing-shell";

/* ─────────────────────────── ANIMATION VARIANTS ─────────────────────────── */

const stagger = {
	hidden: {},
	show: { transition: { staggerChildren: 0.1 } },
};

const staggerFast = {
	hidden: {},
	show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
	hidden: { opacity: 0, y: 10 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: "easeOut" },
	},
};

const fadeIn = {
	hidden: { opacity: 0 },
	show: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
};

/* ─────────────────────────── SHARED COMPONENTS ─────────────────────────── */

function SectionDivider({ label }: { label: string }) {
	return (
		<div className="flex items-center gap-3 my-8 sm:my-10">
			<span className="text-[10px] text-foreground/55 font-mono tracking-wider uppercase shrink-0">
				{label}
			</span>
			<div className="flex-1 border-t border-foreground/[0.10]" />
		</div>
	);
}

function CodeBlock({ comment, lines }: { comment?: string; lines: string[] }) {
	const code = lines.join("\n");
	const html = highlight(code);
	return (
		<motion.div
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-40px" }}
			variants={fadeUp}
			className="border border-foreground/[0.15] bg-foreground/[0.04] p-4 font-mono text-xs leading-relaxed overflow-x-auto"
		>
			{comment && (
				<div className="text-foreground/40 select-none mb-2">{comment}</div>
			)}
			<pre className="m-0">
				<code dangerouslySetInnerHTML={{ __html: html }} />
			</pre>
		</motion.div>
	);
}

function FlowStep({
	num,
	from,
	to,
	label,
	detail,
	code,
}: {
	num: string;
	from: string;
	to: string;
	label: string;
	detail?: string;
	code?: string;
}) {
	return (
		<motion.div variants={fadeUp} className="flex gap-3 items-start">
			<div className="text-[10px] font-mono text-foreground/35 mt-0.5 shrink-0 w-5 text-right">
				{num}
			</div>
			<div className="flex-1 border border-foreground/[0.15] bg-foreground/[0.04] p-3">
				<div className="flex items-center gap-1.5 mb-1">
					<span className="text-[10px] font-mono text-foreground/45">
						{from}
					</span>
					<ArrowRight
						className="h-2.5 w-2.5 text-foreground/25"
						strokeWidth={1.5}
					/>
					<span className="text-[10px] font-mono text-foreground/45">{to}</span>
				</div>
				<div className="text-[13px] text-foreground/80 font-medium">
					{label}
				</div>
				{detail && (
					<div className="text-[11px] text-foreground/55 mt-1 leading-relaxed">
						{detail}
					</div>
				)}
				{code && (
					<div className="text-[10px] font-mono text-foreground/40 mt-2 bg-foreground/[0.05] px-2 py-1.5 border border-foreground/[0.10]">
						{code}
					</div>
				)}
			</div>
		</motion.div>
	);
}

/* ─────────────────────────── DIAGRAMS ─────────────────────────── */

function ProblemCards() {
	return (
		<motion.div
			className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4"
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-40px" }}
			variants={stagger}
		>
			{[
				{
					icon: Eye,
					title: "No visibility",
					desc: "The server can't tell which agent made a request. Every call looks like it came from the same OAuth client.",
				},
				{
					icon: Shield,
					title: "No scoping",
					desc: "Every agent gets the user's full permissions. You can't give one agent read-only and another write access.",
				},
				{
					icon: Lock,
					title: "No isolation",
					desc: "Revoking one agent means invalidating the token for all of them. A compromised agent means rotating everything.",
				},
			].map((item) => (
				<motion.div
					key={item.title}
					variants={fadeUp}
					className="border border-foreground/[0.15] bg-foreground/[0.04] p-4"
				>
					<item.icon
						className="h-4 w-4 text-foreground/40 mb-2.5"
						strokeWidth={1.5}
					/>
					<div className="text-[12px] font-medium text-foreground/80 mb-1.5">
						{item.title}
					</div>
					<div className="text-[11px] text-foreground/50 leading-relaxed">
						{item.desc}
					</div>
				</motion.div>
			))}
		</motion.div>
	);
}

function IdentityComparison() {
	return (
		<motion.div
			className="border border-foreground/[0.15] bg-foreground/[0.03] p-5 sm:p-6 mb-4"
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-40px" }}
			variants={stagger}
		>
			<motion.div
				variants={fadeIn}
				className="text-[10px] font-mono text-foreground/40 mb-4 uppercase tracking-wider"
			>
				Why existing auth fails for agents
			</motion.div>
			<div className="space-y-2">
				{[
					{
						approach: "OAuth tokens",
						continuity: true,
						distinctiveness: false,
						problem:
							"Same token across requests, but every agent behind a client looks identical",
					},
					{
						approach: "API keys",
						continuity: false,
						distinctiveness: true,
						problem:
							"Can issue many, but no lifecycle, no state transitions, no revocation boundary",
					},
					{
						approach: "Agent Auth",
						continuity: true,
						distinctiveness: true,
						problem: null,
					},
				].map((row) => (
					<motion.div
						key={row.approach}
						variants={fadeUp}
						className={`flex items-center gap-3 px-3 py-2.5 border ${
							row.problem === null
								? "border-foreground/[0.25] bg-foreground/[0.06]"
								: "border-foreground/[0.10] bg-foreground/[0.02]"
						}`}
					>
						<div className="text-[11px] font-mono text-foreground/65 w-24 shrink-0">
							{row.approach}
						</div>
						<div className="flex items-center gap-3 flex-1">
							<div className="flex items-center gap-1">
								{row.continuity ? (
									<Check className="h-3 w-3 text-foreground/50" />
								) : (
									<X className="h-3 w-3 text-foreground/25" />
								)}
								<span className="text-[10px] font-mono text-foreground/40">
									continuity
								</span>
							</div>
							<div className="flex items-center gap-1">
								{row.distinctiveness ? (
									<Check className="h-3 w-3 text-foreground/50" />
								) : (
									<X className="h-3 w-3 text-foreground/25" />
								)}
								<span className="text-[10px] font-mono text-foreground/40">
									distinctiveness
								</span>
							</div>
						</div>
						{row.problem && (
							<div className="text-[10px] text-foreground/35 hidden sm:block max-w-[200px]">
								{row.problem}
							</div>
						)}
					</motion.div>
				))}
			</div>
		</motion.div>
	);
}

function ArchitectureDiagram() {
	return (
		<motion.div
			className="border border-foreground/[0.15] bg-foreground/[0.03] p-5 sm:p-6 mb-4"
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-60px" }}
			variants={stagger}
		>
			<motion.div
				variants={fadeIn}
				className="text-[10px] font-mono text-foreground/40 mb-5 uppercase tracking-wider"
			>
				Runtime participants
			</motion.div>
			<motion.div variants={stagger} className="space-y-2.5">
				<motion.div variants={fadeUp} className="flex gap-3 items-center">
					<div className="w-10 h-10 border border-foreground/[0.25] bg-background flex items-center justify-center shrink-0">
						<Bot className="h-4 w-4 text-foreground/65" strokeWidth={1.5} />
					</div>
					<div>
						<div className="text-[11px] font-mono text-foreground/75">
							Agent
						</div>
						<div className="text-[10px] text-foreground/45">
							The AI that needs to act. Has an agent ID, calls client tools,
							authenticates with short-lived signed JWTs.
						</div>
					</div>
				</motion.div>

				<motion.div variants={fadeUp} className="flex gap-3 items-center">
					<div className="w-10 h-10 border border-foreground/20 bg-background flex items-center justify-center shrink-0">
						<Settings2
							className="h-4 w-4 text-foreground/55"
							strokeWidth={1.5}
						/>
					</div>
					<div>
						<div className="text-[11px] font-mono text-foreground/75">
							Client{" "}
							<span className="text-foreground/35">
								(MCP server, CLI, SDK)
							</span>
						</div>
						<div className="text-[10px] text-foreground/45">
							The process that holds a host identity, manages keys, signs
							requests, and exposes protocol tools to AI systems. Cursor, Claude
							Code, or any runtime that implements the protocol.
						</div>
					</div>
				</motion.div>

				<motion.div variants={fadeUp} className="flex gap-3 items-center">
					<div className="w-10 h-10 border border-foreground/20 bg-background flex items-center justify-center shrink-0">
						<Server className="h-4 w-4 text-foreground/55" strokeWidth={1.5} />
					</div>
					<div>
						<div className="text-[11px] font-mono text-foreground/75">
							Server
						</div>
						<div className="text-[10px] text-foreground/45">
							The service&apos;s authorization server. Manages discovery,
							registrations, capabilities, approvals, and JWT verification.
						</div>
					</div>
				</motion.div>
			</motion.div>

			<motion.div
				variants={fadeUp}
				className="mt-4 pt-3 border-t border-foreground/[0.10]"
			>
				<div className="text-[10px] font-mono text-foreground/40 mb-2 uppercase tracking-wider">
					Two identity types
				</div>
				<div className="flex gap-4">
					<div className="flex-1">
						<div className="text-[11px] font-mono text-foreground/65 mb-0.5">
							Host
						</div>
						<div className="text-[10px] text-foreground/45 leading-snug">
							Persistent identity of the client environment. Carries default
							capabilities and optional user link. One host creates many agents.
						</div>
					</div>
					<div className="flex-1">
						<div className="text-[11px] font-mono text-foreground/65 mb-0.5">
							Agent
						</div>
						<div className="text-[10px] text-foreground/45 leading-snug">
							Per-session runtime identity. Owns a keypair, has individually
							granted capabilities and its own lifecycle. Each agent is registered
							under a host.
						</div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}

function ProtocolFlowDiagram() {
	return (
		<motion.div
			className="space-y-2 mb-4"
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-60px" }}
			variants={stagger}
		>
			<motion.div
				variants={fadeIn}
				className="text-[10px] font-mono text-foreground/40 mb-3 uppercase tracking-wider"
			>
				Registration flow
			</motion.div>
			<FlowStep
				num="A"
				from="agent"
				to="client"
				label="Agent requests connection"
				detail="Agent calls connect_agent with requested capabilities, a reason, and a mode (delegated or autonomous)."
				code='connect_agent({ provider: "bank", capabilities: ["check_balance", "transfer_domestic"], mode: "delegated" })'
			/>
			<FlowStep
				num="B"
				from="client"
				to="server"
				label="Client registers agent on the server"
				detail="Client signs a host JWT containing the agent's public key and sends it with the registration request."
				code="POST /agent/register  Authorization: Bearer <host_jwt>"
			/>
			<FlowStep
				num="C"
				from="server"
				to="client"
				label="Server returns agent ID and capability grants"
				detail='Grants are either "active" (auto-approved for trusted hosts) or "pending" (approval required).'
				code='→ { agent_id: "agt_abc123", status: "pending", agent_capability_grants: [...], approval: {...} }'
			/>
			<FlowStep
				num="D"
				from="user"
				to="server"
				label="User approves in their browser"
				detail="For pending registrations, the user navigates to a verification URL (device auth) or receives a push notification (CIBA) to approve the host and grant capabilities."
			/>
			<FlowStep
				num="E"
				from="client"
				to="agent"
				label="Agent receives identity and granted capabilities"
				detail="The client stores the connection locally. The agent now has an identity, a keypair, and a set of granted capabilities."
			/>
		</motion.div>
	);
}

function ExecutionFlowDiagram() {
	return (
		<motion.div
			className="space-y-2 mb-4"
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-60px" }}
			variants={stagger}
		>
			<motion.div
				variants={fadeIn}
				className="text-[10px] font-mono text-foreground/40 mb-3 uppercase tracking-wider"
			>
				Capability execution
			</motion.div>
			<FlowStep
				num="F"
				from="agent"
				to="client"
				label="Agent calls execute_capability"
				code='execute_capability({ agent_id: "agt_abc123", capability: "check_balance", arguments: { account_id: "acc_123" } })'
			/>
			<FlowStep
				num="G"
				from="client"
				to="server"
				label="Client signs agent JWT and sends to execute endpoint"
				detail="The JWT is short-lived (60s) and scoped to the requested capability."
				code="POST /capability/execute  Authorization: Bearer <agent_jwt>"
			/>
			<FlowStep
				num="H"
				from="server"
				to="server"
				label="Server validates JWT, checks grants, executes capability"
				detail="Verifies signature, checks agent status, resolves granted capabilities, enforces constraints, then executes against the backend service."
			/>
			<FlowStep
				num="I"
				from="server"
				to="agent"
				label="Result returned to agent"
				code='→ { data: { account_id: "acc_123", balance: 4280.13, currency: "USD" } }'
			/>
		</motion.div>
	);
}

function KeypairDiagram() {
	return (
		<motion.div
			className="border border-foreground/[0.15] bg-foreground/[0.03] p-5 sm:p-6 mb-4"
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-60px" }}
			variants={stagger}
		>
			<motion.div
				variants={fadeIn}
				className="text-[10px] font-mono text-foreground/40 mb-4 uppercase tracking-wider"
			>
				Ed25519 keypairs — asymmetric authentication
			</motion.div>
			<motion.div
				variants={stagger}
				className="flex items-start justify-center gap-4 sm:gap-8 min-w-[300px]"
			>
				<motion.div variants={fadeUp} className="flex-1 max-w-[200px]">
					<div className="border border-foreground/20 bg-background p-3 text-center mb-2">
						<Settings2
							className="h-4 w-4 text-foreground/55 mx-auto mb-1.5"
							strokeWidth={1.5}
						/>
						<div className="text-[11px] font-mono text-foreground/75">
							Client
						</div>
					</div>
					<div className="space-y-1.5">
						<div className="border border-foreground/[0.15] bg-foreground/[0.05] px-2.5 py-1.5 text-[10px] font-mono text-foreground/55">
							<Lock
								className="h-3 w-3 inline mr-1.5 text-foreground/40"
								strokeWidth={1.5}
							/>
							private key (host + agent)
						</div>
						<div className="border border-foreground/[0.15] bg-foreground/[0.05] px-2.5 py-1.5 text-[10px] font-mono text-foreground/55">
							<KeyRound
								className="h-3 w-3 inline mr-1.5 text-foreground/40"
								strokeWidth={1.5}
							/>
							public key (host + agent)
						</div>
					</div>
					<div className="text-[9px] text-foreground/35 text-center mt-2 font-mono">
						signs JWTs with private keys
					</div>
				</motion.div>

				<motion.div
					variants={fadeUp}
					className="flex flex-col items-center pt-8 gap-1"
				>
					<div className="text-[9px] font-mono text-foreground/35">
						registers
					</div>
					<ArrowRight className="h-4 w-4 text-foreground/25" strokeWidth={1} />
					<div className="text-[9px] font-mono text-foreground/35">
						public key only
					</div>
				</motion.div>

				<motion.div variants={fadeUp} className="flex-1 max-w-[200px]">
					<div className="border border-foreground/20 bg-background p-3 text-center mb-2">
						<Server
							className="h-4 w-4 text-foreground/55 mx-auto mb-1.5"
							strokeWidth={1.5}
						/>
						<div className="text-[11px] font-mono text-foreground/75">
							Server
						</div>
					</div>
					<div className="space-y-1.5">
						<div className="border border-foreground/[0.15] bg-foreground/[0.05] px-2.5 py-1.5 text-[10px] font-mono text-foreground/55">
							<KeyRound
								className="h-3 w-3 inline mr-1.5 text-foreground/40"
								strokeWidth={1.5}
							/>
							public key (stored)
						</div>
						<div className="border border-dashed border-foreground/[0.15] px-2.5 py-1.5 text-[10px] font-mono text-foreground/35">
							<Lock
								className="h-3 w-3 inline mr-1.5 text-foreground/20"
								strokeWidth={1.5}
							/>
							no private key
						</div>
					</div>
					<div className="text-[9px] text-foreground/35 text-center mt-2 font-mono">
						verifies JWTs with public key
					</div>
				</motion.div>
			</motion.div>
			<motion.div
				variants={fadeUp}
				className="mt-3 pt-3 border-t border-foreground/[0.10] text-[10px] text-foreground/45 leading-relaxed"
			>
				Both hosts and agents use Ed25519 (RFC 8037) keypairs. Keys can be
				registered inline (JWK) or via a JWKS URL for key rotation. The private
				key never leaves the client.
			</motion.div>
		</motion.div>
	);
}

function LifecycleDiagram() {
	return (
		<motion.div
			className="border border-foreground/[0.15] bg-foreground/[0.03] p-5 sm:p-6 mb-4"
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-40px" }}
			variants={stagger}
		>
			<motion.div
				variants={fadeIn}
				className="text-[10px] font-mono text-foreground/40 mb-4 uppercase tracking-wider"
			>
				Agent states
			</motion.div>
			<motion.div variants={stagger} className="space-y-1.5">
				{[
					{
						state: "pending",
						desc: "Awaiting user approval. Cannot authenticate.",
						active: false,
					},
					{
						state: "active",
						desc: "Operational. Each request extends the session TTL.",
						active: true,
					},
					{
						state: "expired",
						desc: "Session TTL or max lifetime elapsed. Can be reactivated.",
						active: false,
					},
					{
						state: "revoked",
						desc: "Permanent. Cannot be reactivated. Public key wiped.",
						active: false,
					},
					{
						state: "rejected",
						desc: "User denied the registration request.",
						active: false,
					},
					{
						state: "claimed",
						desc: "Autonomous agent claimed when its host was linked to a user. Terminal.",
						active: false,
					},
				].map((item) => (
					<motion.div
						key={item.state}
						variants={fadeUp}
						className={`flex items-start gap-3 px-3 py-2 border ${
							item.active
								? "border-foreground/[0.25] bg-foreground/[0.06]"
								: "border-foreground/[0.10] bg-foreground/[0.02]"
						}`}
					>
						<div className="text-[11px] font-mono text-foreground/60 w-16 shrink-0">
							{item.state}
						</div>
						<div className="text-[10px] text-foreground/45 leading-snug">
							{item.desc}
						</div>
					</motion.div>
				))}
			</motion.div>
			<motion.div
				variants={fadeUp}
				className="mt-4 pt-3 border-t border-foreground/[0.10]"
			>
				<div className="text-[10px] font-mono text-foreground/40 mb-2 uppercase tracking-wider">
					Three independent clocks
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					{[
						{
							clock: "Session TTL",
							desc: "Measured from the last request. Protects against abandoned agents.",
						},
						{
							clock: "Max lifetime",
							desc: "Measured from last activation. Caps continuous use even for active agents.",
						},
						{
							clock: "Absolute lifetime",
							desc: "Hard limit from creation. Once elapsed, the agent is permanently revoked.",
						},
					].map((item) => (
						<div key={item.clock}>
							<div className="text-[10px] font-mono text-foreground/55 mb-0.5">
								{item.clock}
							</div>
							<div className="text-[10px] text-foreground/40 leading-snug">
								{item.desc}
							</div>
						</div>
					))}
				</div>
			</motion.div>
		</motion.div>
	);
}

function CapabilityDiagram() {
	return (
		<motion.div
			className="border border-foreground/[0.15] bg-foreground/[0.03] p-5 sm:p-6 mb-4"
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-40px" }}
			variants={staggerFast}
		>
			<motion.div
				variants={fadeIn}
				className="text-[10px] font-mono text-foreground/40 mb-4 uppercase tracking-wider"
			>
				Capability grant with constraints
			</motion.div>
			<motion.div
				variants={fadeUp}
				className="font-mono text-[11px] leading-[1.8] text-foreground/55 space-y-0.5"
			>
				<div>{"{"}</div>
				<div className="pl-4">
					capability:{" "}
					<span className="text-foreground/40">
						&quot;transfer_money&quot;
					</span>
				</div>
				<div className="pl-4">
					status:{" "}
					<span className="text-foreground/40">&quot;active&quot;</span>
				</div>
				<div className="pl-4">constraints: {"{"}</div>
				<div className="pl-8">
					destination_account:{" "}
					<span className="text-foreground/40">&quot;acc_456&quot;</span>
					<span className="text-foreground/30">
						{" "}
						// exact value — must match
					</span>
				</div>
				<div className="pl-8">
					amount: {"{"} min: <span className="text-foreground/40">0</span>,
					max: <span className="text-foreground/40">1000</span> {"}"}
					<span className="text-foreground/30"> // operator range</span>
				</div>
				<div className="pl-8">
					currency: {"{"} in: [
					<span className="text-foreground/40">
						&quot;USD&quot;, &quot;EUR&quot;
					</span>
					] {"}"}
				</div>
				<div className="pl-4">{"}"}</div>
				<div>{"}"}</div>
			</motion.div>
			<motion.div
				variants={fadeUp}
				className="mt-3 pt-3 border-t border-foreground/[0.10] text-[10px] text-foreground/45 leading-relaxed"
			>
				This grant allows transfers of up to $1,000 in USD or EUR, but only to
				account acc_456. Any execution that violates these constraints is
				rejected. Grants without constraints permit any valid input.
			</motion.div>
		</motion.div>
	);
}

function EscalationFlow() {
	return (
		<motion.div
			className="space-y-2 mb-4"
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-60px" }}
			variants={stagger}
		>
			<motion.div
				variants={fadeIn}
				className="text-[10px] font-mono text-foreground/40 mb-3 uppercase tracking-wider"
			>
				Runtime capability escalation
			</motion.div>
			<FlowStep
				num="1"
				from="agent"
				to="server"
				label="Agent requests additional capabilities"
				detail='The server creates "pending" grant rows. The agent remains active — only the new grants are pending.'
				code='POST /agent/request-capability  { capabilities: ["transfer_international"], reason: "User requested a wire transfer" }'
			/>
			<FlowStep
				num="2"
				from="server"
				to="agent"
				label="Returns approval flow"
				detail="The agent polls GET /agent/status until the user resolves the pending capabilities."
				code='→ { agent_capability_grants: [{ capability: "transfer_international", status: "pending" }], approval: { method: "device_authorization", ... } }'
			/>
			<FlowStep
				num="3"
				from="user"
				to="server"
				label="User approves or denies"
				detail='Approved capabilities flip to "active" with full details. Denied ones flip to "denied" with an optional reason. Each capability is independent.'
			/>
		</motion.div>
	);
}

function SecurityHighlights() {
	return (
		<motion.div
			className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4"
			initial="hidden"
			whileInView="show"
			viewport={{ once: true, margin: "-40px" }}
			variants={stagger}
		>
			{[
				{
					icon: Lock,
					title: "Private keys never leave the client",
					desc: "The server stores only public keys. Agent and host private keys are generated and held locally.",
				},
				{
					icon: Clock,
					title: "Short-lived JWTs (60s TTL)",
					desc: "Every request carries a fresh JWT. Short lifetimes limit misuse even without proof of possession.",
				},
				{
					icon: Shield,
					title: "Replay protection",
					desc: "All JWTs include a unique jti claim. The server caches seen values and rejects duplicates.",
				},
				{
					icon: Zap,
					title: "Revocation cascade",
					desc: "Revoking a host permanently revokes all agents under it. Individual agent revocation is also supported.",
				},
				{
					icon: ShieldAlert,
					title: "Approval self-authorization",
					desc: "Agents often control the user's browser. Approval pages should require fresh auth, passkeys, or 2FA — not stale sessions.",
				},
				{
					icon: Fingerprint,
					title: "Optional proof of possession",
					desc: "For high-security deployments: DPoP (RFC 9449) or mTLS (RFC 8705) bind the JWT to a specific key or certificate.",
				},
			].map((item) => (
				<motion.div
					key={item.title}
					variants={fadeUp}
					className="border border-foreground/[0.15] bg-foreground/[0.04] p-3"
				>
					<item.icon
						className="h-3.5 w-3.5 text-foreground/40 mb-1.5"
						strokeWidth={1.5}
					/>
					<div className="text-[12px] font-medium text-foreground/75 mb-1">
						{item.title}
					</div>
					<div className="text-[11px] text-foreground/50 leading-relaxed">
						{item.desc}
					</div>
				</motion.div>
			))}
		</motion.div>
	);
}

/* ─────────────────────────── MAIN CONTENT ─────────────────────────── */

function SpecContent() {
	return (
		<>
			{/* ── THE PROBLEM ── */}
			<h2 className="text-base sm:text-lg font-medium text-foreground mb-4 tracking-tight">
				The problem
			</h2>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-5">
				<p>
					AI agents are becoming long-lived actors: copilots, background
					workers, scheduled automations, and multi-step systems that call
					external services without constant human supervision. Today&apos;s
					auth models were not designed for this.
				</p>
				<p>
					When an agent acts on behalf of a user, it typically reuses the
					user&apos;s OAuth token or a shared client credential. That collapses
					every agent into the same identity.
				</p>
			</div>

			<ProblemCards />

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-4">
				<p>
					And for autonomous agents that operate without a user in the loop,
					there is no identity model at all. The agent is forced to pretend to
					be a human — opening a browser, solving a CAPTCHA, clicking through a
					signup flow — just to use a service.
				</p>
				<p>
					There is also no standard way for a service to advertise that it
					supports agents, what capabilities it offers, or how an agent should
					begin authenticating. Every new integration requires hardcoded
					configuration or a human pointing the agent to the right endpoint.
				</p>
			</div>

			<SectionDivider label="The Identity Gap" />

			<h2 className="text-base sm:text-lg font-medium text-foreground mb-4 tracking-tight">
				Agents don&apos;t have identity
			</h2>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-5">
				<p>
					The problems above share a single root cause. Identity requires two
					properties:{" "}
					<span className="text-foreground/90 font-medium">continuity</span>{" "}
					(the server can verify it&apos;s dealing with the same agent across
					requests) and{" "}
					<span className="text-foreground/90 font-medium">
						distinctiveness
					</span>{" "}
					(each agent can be individually identified, scoped, audited, and
					revoked without affecting any other).
				</p>
				<p>
					Existing auth models give at most one. Agent Auth gives every agent
					both.
				</p>
			</div>

			<IdentityComparison />

			<SectionDivider label="The Solution" />

			<h2 className="text-base sm:text-lg font-medium text-foreground mb-4 tracking-tight">
				Make the agent a first-class principal
			</h2>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-5">
				<p>
					Instead of borrowing a user&apos;s session or a shared application
					token, each agent is registered with its own identity, granted
					capabilities, and lifecycle. When the agent needs to act, it
					authenticates with short-lived signed JWTs tied to that registration.
				</p>
				<p>
					The server gets something existing auth models are missing: a durable
					way to identify which specific agent is acting, which host it belongs
					to, what mode it runs in, what capabilities it holds, and how to
					suspend, expire, or revoke it without affecting everything else.
				</p>
			</div>

			<ArchitectureDiagram />

			<SectionDivider label="Protocol Flow" />

			<h2 className="text-base sm:text-lg font-medium text-foreground mb-4 tracking-tight">
				From discovery to execution
			</h2>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-5">
				<p>
					The protocol defines a complete flow: discovery, registration,
					approval, and capability execution. Agents find a service, register
					under a host, get capabilities granted (with user approval when
					needed), and execute them through the server.
				</p>
			</div>

			<ProtocolFlowDiagram />
			<div className="h-4" />
			<ExecutionFlowDiagram />

			<SectionDivider label="Agent Modes" />

			<h2 className="text-base sm:text-lg font-medium text-foreground mb-4 tracking-tight">
				Delegated and autonomous agents
			</h2>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-5">
				<p>
					An agent operates in one of two modes, chosen at registration. The
					mode determines its relationship to a user and cannot be changed after
					creation.
				</p>
			</div>

			<motion.div
				className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4"
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-40px" }}
				variants={stagger}
			>
				<motion.div
					variants={fadeUp}
					className="border border-foreground/[0.15] bg-foreground/[0.04] p-4"
				>
					<div className="flex items-center gap-2 mb-2">
						<Users
							className="h-4 w-4 text-foreground/45"
							strokeWidth={1.5}
						/>
						<div className="text-[12px] font-mono font-medium text-foreground/75">
							Delegated
						</div>
					</div>
					<div className="text-[11px] text-foreground/50 leading-relaxed mb-2">
						The agent acts on behalf of a specific user. The user sees what
						the agent is requesting and decides what to allow. This is the
						common case.
					</div>
					<div className="text-[10px] font-mono text-foreground/35 bg-foreground/[0.05] px-2 py-1.5 border border-foreground/[0.10]">
						Example: An email assistant that requests permission to read your
						inbox and send replies on your behalf.
					</div>
				</motion.div>
				<motion.div
					variants={fadeUp}
					className="border border-foreground/[0.15] bg-foreground/[0.04] p-4"
				>
					<div className="flex items-center gap-2 mb-2">
						<Bot className="h-4 w-4 text-foreground/45" strokeWidth={1.5} />
						<div className="text-[12px] font-mono font-medium text-foreground/75">
							Autonomous
						</div>
					</div>
					<div className="text-[11px] text-foreground/50 leading-relaxed mb-2">
						The agent operates without a user in the loop. Capabilities are
						granted by server policy or admin approval. For background workers,
						scheduled automations, service-to-service agents.
					</div>
					<div className="text-[10px] font-mono text-foreground/35 bg-foreground/[0.05] px-2 py-1.5 border border-foreground/[0.10]">
						Example: A deployment agent that provisions resources and deploys a
						website without waiting for a user.
					</div>
				</motion.div>
			</motion.div>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-4">
				<p>
					A server may support delegated agents, autonomous agents, or both.
					When an autonomous agent&apos;s host is later linked to a user, the
					agent is &quot;claimed&quot; — its activity history is attributed to
					the user, its capabilities are revoked, and it becomes terminal. A new
					delegated agent takes over.
				</p>
			</div>

			<SectionDivider label="Capabilities" />

			<h2 className="text-base sm:text-lg font-medium text-foreground mb-4 tracking-tight">
				Capability-based authorization
			</h2>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-5">
				<p>
					Capabilities are the protocol&apos;s unit of authorization. A
					capability is a server-offered action described by a stable identifier
					and a human-readable description. Each capability can define input and
					output schemas so agents know what arguments to supply and what data
					to expect.
				</p>
				<p>
					Agent capabilities are stored as individual{" "}
					<span className="font-mono text-foreground/75 text-xs">
						capability grant
					</span>{" "}
					records rather than flat arrays. This enables per-capability metadata
					(expiry, grant source, reason) and granular revocation. Each grant can
					carry{" "}
					<span className="font-mono text-foreground/75 text-xs">
						constraints
					</span>{" "}
					— restrictions on the input values an agent is authorized to supply.
				</p>
			</div>

			<CapabilityDiagram />

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-5">
				<p>
					Constraints can be proposed by the agent, imposed by the server, or
					both — the tightest constraint from either source wins. Supported
					operators include exact value matching,{" "}
					<span className="font-mono text-foreground/75 text-xs">max</span>,{" "}
					<span className="font-mono text-foreground/75 text-xs">min</span>,{" "}
					<span className="font-mono text-foreground/75 text-xs">in</span>, and{" "}
					<span className="font-mono text-foreground/75 text-xs">not_in</span>.
				</p>
			</div>

			<EscalationFlow />

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] mb-4">
				<p>
					The execute endpoint supports three interaction modes: synchronous
					(default), streaming (Server-Sent Events), and asynchronous (
					<span className="font-mono text-foreground/75 text-xs">
						202 Accepted
					</span>{" "}
					with a status URL for polling). The server determines the mode — the
					agent doesn&apos;t need to know.
				</p>
			</div>

			<SectionDivider label="Authentication" />

			<h2 className="text-base sm:text-lg font-medium text-foreground mb-4 tracking-tight">
				Ed25519 asymmetric authentication
			</h2>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-5">
				<p>
					Both hosts and agents use Ed25519 keypairs. The private key never
					leaves the client. The server stores only the public key (or a JWKS
					URL for key rotation). Every request carries a short-lived JWT (60s
					TTL) signed with the caller&apos;s private key.
				</p>
				<p>
					Two JWT types:{" "}
					<span className="font-mono text-foreground/75 text-xs">
						Host JWT
					</span>{" "}
					for registration, status checks, and management operations (signed
					with the host&apos;s key).{" "}
					<span className="font-mono text-foreground/75 text-xs">
						Agent JWT
					</span>{" "}
					for capability execution (signed with the agent&apos;s key, includes{" "}
					<span className="font-mono text-foreground/75 text-xs">sub</span>,{" "}
					<span className="font-mono text-foreground/75 text-xs">aud</span>,{" "}
					<span className="font-mono text-foreground/75 text-xs">exp</span>,{" "}
					<span className="font-mono text-foreground/75 text-xs">jti</span>,
					and an optional{" "}
					<span className="font-mono text-foreground/75 text-xs">
						capabilities
					</span>{" "}
					restriction).
				</p>
			</div>

			<KeypairDiagram />

			<CodeBlock
				comment="// agent JWT payload"
				lines={[
					"{",
					'  "sub": "agt_k7x9m2",        // agent ID',
					'  "aud": "https://api.bank.com", // server issuer URL',
					'  "iat": 1710000000,',
					'  "exp": 1710000060,            // 60s TTL',
					'  "jti": "a-xyz789",            // unique per request',
					'  "capabilities": ["check_balance"] // optional restriction',
					"}",
				]}
			/>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] mt-5 mb-4">
				<p>
					The server verifies JWTs through a strict pipeline: extract agent ID
					from{" "}
					<span className="font-mono text-foreground/75 text-xs">sub</span>,
					verify{" "}
					<span className="font-mono text-foreground/75 text-xs">aud</span>{" "}
					matches the server&apos;s own issuer URL, check agent and host status,
					verify signature against the stored public key, check{" "}
					<span className="font-mono text-foreground/75 text-xs">exp</span>/
					<span className="font-mono text-foreground/75 text-xs">iat</span>/
					<span className="font-mono text-foreground/75 text-xs">jti</span>{" "}
					replay, resolve active grants, and enforce any constraints.
				</p>
			</div>

			<SectionDivider label="Lifecycle" />

			<h2 className="text-base sm:text-lg font-medium text-foreground mb-4 tracking-tight">
				Agent states and lifetime clocks
			</h2>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-5">
				<p>
					Every agent is in exactly one state at any time. Only{" "}
					<span className="font-mono text-foreground/75 text-xs">active</span>{" "}
					agents can authenticate and make requests. Three independent clocks
					govern lifetimes — the server may vary them per agent based on mode,
					host, or capabilities.
				</p>
				<p>
					Expired agents can be reactivated, but reactivation is a security
					checkpoint: capabilities decay to the host&apos;s defaults, escalated
					capabilities must be re-requested, and the session and max lifetime
					clocks reset. The absolute lifetime clock never resets — once it
					elapses, the agent is permanently revoked.
				</p>
			</div>

			<LifecycleDiagram />

			<SectionDivider label="Discovery" />

			<h2 className="text-base sm:text-lg font-medium text-foreground mb-4 tracking-tight">
				Service discovery
			</h2>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-5">
				<p>
					Servers publish a discovery endpoint at{" "}
					<span className="font-mono text-foreground/75 text-xs">
						/.well-known/agent-configuration
					</span>
					. No authentication required. This tells agents everything they need:
					the server&apos;s issuer URL, supported algorithms, supported modes,
					approval methods, and all endpoint paths.
				</p>
				<p>
					Clients can also look up providers through a registry — a searchable
					index of services that support Agent Auth. When an agent calls{" "}
					<span className="font-mono text-foreground/75 text-xs">
						search_providers
					</span>
					, the client queries its configured registry to find matching services
					by natural language intent.
				</p>
			</div>

			<CodeBlock
				comment="GET /.well-known/agent-configuration"
				lines={[
					"{",
					'  "version": "1.0-draft",',
					'  "provider_name": "bank",',
					'  "description": "Banking services — accounts, transfers, and payments",',
					'  "issuer": "https://auth.bank.com",',
					'  "algorithms": ["Ed25519"],',
					'  "modes": ["delegated", "autonomous"],',
					'  "approval_methods": ["device_authorization", "ciba"],',
					'  "endpoints": {',
					'    "register": "/agent/register",',
					'    "capabilities": "/capability/list",',
					'    "describe_capability": "/capability/describe",',
					'    "execute": "/capability/execute",',
					'    "request_capability": "/agent/request-capability",',
					'    "status": "/agent/status",',
					'    "revoke": "/agent/revoke",',
					'    "introspect": "/agent/introspect"',
					"  }",
					"}",
				]}
			/>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] mt-5 mb-4">
				<p>
					Resource servers can also include a{" "}
					<span className="font-mono text-foreground/75 text-xs">
						WWW-Authenticate: AgentAuth
					</span>{" "}
					challenge on 401 responses to point agents toward the authorization
					server&apos;s discovery endpoint — useful when the API and auth server
					are on different domains.
				</p>
			</div>

			<SectionDivider label="Approval" />

			<h2 className="text-base sm:text-lg font-medium text-foreground mb-4 tracking-tight">
				How approval works
			</h2>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-5">
				<p>
					When registration or capability escalation requires user consent, the
					server returns an approval object describing how the client should
					facilitate it. Two methods are defined:
				</p>
			</div>

			<motion.div
				className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4"
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-40px" }}
				variants={stagger}
			>
				<motion.div
					variants={fadeUp}
					className="border border-foreground/[0.25] bg-foreground/[0.04] p-4"
				>
					<div className="text-[12px] font-mono font-medium text-foreground/75 mb-2">
						Device Authorization
					</div>
					<div className="text-[11px] text-foreground/50 leading-relaxed mb-2">
						Baseline method — every server must support it. The user navigates
						to a URL and enters a code on a separate device. The client polls{" "}
						<span className="font-mono text-foreground/60">
							GET /agent/status
						</span>{" "}
						until approved.
					</div>
					<div className="text-[9px] font-mono text-foreground/35">
						RFC 8628
					</div>
				</motion.div>
				<motion.div
					variants={fadeUp}
					className="border border-foreground/[0.15] bg-foreground/[0.04] p-4"
				>
					<div className="text-[12px] font-mono font-medium text-foreground/75 mb-2">
						CIBA
					</div>
					<div className="text-[11px] text-foreground/50 leading-relaxed mb-2">
						Used when the server already knows the user. The server pushes a
						notification (mobile app, email, in-app). Better UX — no URL
						navigation needed.
					</div>
					<div className="text-[9px] font-mono text-foreground/35">
						Client Initiated Backchannel Authentication
					</div>
				</motion.div>
			</motion.div>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-4">
				<p>
					The server decides which method to use. Clients can pass a{" "}
					<span className="font-mono text-foreground/75 text-xs">
						preferred_method
					</span>{" "}
					hint, but the server makes the final call. For trusted hosts with
					default capabilities, registration can be auto-approved with no user
					interaction at all.
				</p>
			</div>

			<SectionDivider label="Security" />

			<h2 className="text-base sm:text-lg font-medium text-foreground mb-4 tracking-tight">
				Security model
			</h2>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] mb-5">
				<p>
					The base security model is short-lived signed JWTs over TLS.
					Sufficient for most applications. For higher-assurance deployments,
					the protocol supports DPoP and mTLS proof-of-possession profiles.
				</p>
			</div>

			<SecurityHighlights />

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-4">
				<p>
					Servers must implement rate limiting at multiple levels (per agent,
					per host, per user, per capability, per IP). Discovery of arbitrary
					URLs is a prompt injection vector — clients should resolve new
					services through a trusted registry rather than URLs provided by
					agents.
				</p>
			</div>

			<SectionDivider label="Data Model" />

			<h2 className="text-base sm:text-lg font-medium text-foreground mb-4 tracking-tight">
				Three tables
			</h2>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-5">
				<p>
					The protocol operates on three logical entities. Implementations can
					store them however they choose, as long as the protocol-facing
					behavior is preserved.
				</p>
			</div>

			<motion.div
				className="border border-foreground/[0.15] bg-foreground/[0.03] p-5 sm:p-6 mb-4"
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-40px" }}
				variants={staggerFast}
			>
				<motion.div variants={stagger} className="space-y-3">
					{[
						{
							table: "Host",
							fields:
								"id, name, public_key or jwks_url, user_id, default_capabilities, status, timestamps",
							desc: "The persistent client identity. Carries a keypair, optional user link, and default capability budget.",
						},
						{
							table: "Agent",
							fields:
								"id, name, host_id, user_id, public_key or jwks_url, status, mode, timestamps",
							desc: 'Pure identity — the runtime AI actor. Registered under a host. Mode is "delegated" or "autonomous", immutable after creation.',
						},
						{
							table: "Agent Capability Grant",
							fields:
								"id, agent_id, capability, status, constraints, granted_by, denied_by, reason, expires_at, timestamps",
							desc: "One row per capability per agent. Enables per-capability metadata, granular revocation, and individual lifecycle.",
						},
					].map((item) => (
						<motion.div
							key={item.table}
							variants={fadeUp}
							className="border border-foreground/[0.10] bg-foreground/[0.02] p-3"
						>
							<div className="text-[11px] font-mono text-foreground/65 mb-1">
								{item.table}
							</div>
							<div className="text-[10px] text-foreground/45 leading-snug mb-1.5">
								{item.desc}
							</div>
							<div className="text-[9px] font-mono text-foreground/30">
								{item.fields}
							</div>
						</motion.div>
					))}
				</motion.div>
			</motion.div>

			<SectionDivider label="Client Tools" />

			<h2 className="text-base sm:text-lg font-medium text-foreground mb-4 tracking-tight">
				The client interface
			</h2>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-5">
				<p>
					The protocol defines a standard set of tools that clients expose to
					agents. The client sits between the agent and the server — it manages
					keys, signs JWTs, and handles the protocol mechanics so agents
					interact through simple tool calls.
				</p>
			</div>

			<motion.div
				className="border border-foreground/[0.15] bg-foreground/[0.03] p-5 sm:p-6 mb-4"
				initial="hidden"
				whileInView="show"
				viewport={{ once: true, margin: "-40px" }}
				variants={staggerFast}
			>
				<motion.div
					variants={fadeIn}
					className="text-[10px] font-mono text-foreground/40 mb-4 uppercase tracking-wider"
				>
					Client tools
				</motion.div>
				<div className="space-y-1.5">
					{[
						{
							tool: "list_providers / search_providers / discover_provider",
							desc: "Discover available services",
						},
						{
							tool: "list_capabilities / describe_capability",
							desc: "Browse and inspect available capabilities",
						},
						{
							tool: "connect_agent",
							desc: "Register a new agent (generates keypair, handles approval)",
						},
						{
							tool: "execute_capability",
							desc: "Execute a granted capability through the server",
						},
						{
							tool: "request_capability",
							desc: "Request additional capabilities at runtime",
						},
						{
							tool: "sign_jwt",
							desc: "Get a signed JWT for direct server-to-server use",
						},
						{
							tool: "agent_status",
							desc: "Check agent health and current grants",
						},
						{
							tool: "reactivate_agent",
							desc: "Reactivate an expired agent (capabilities decay to defaults)",
						},
						{
							tool: "disconnect_agent",
							desc: "Revoke and remove an agent connection",
						},
					].map((item) => (
						<motion.div
							key={item.tool}
							variants={fadeUp}
							className="flex items-start gap-3 px-3 py-2 border border-foreground/[0.10] bg-foreground/[0.02]"
						>
							<div className="text-[10px] font-mono text-foreground/55 shrink-0 min-w-[140px] sm:min-w-[280px]">
								{item.tool}
							</div>
							<div className="text-[10px] text-foreground/40">
								{item.desc}
							</div>
						</motion.div>
					))}
				</div>
			</motion.div>

			<SectionDivider label="Relationship to Other Specs" />

			<h2 className="text-base sm:text-lg font-medium text-foreground mb-4 tracking-tight">
				Where Agent Auth sits
			</h2>

			<div className="text-[13px] sm:text-sm text-foreground/70 leading-[1.85] space-y-4 mb-4">
				<p>
					Agent Auth builds on existing standards: Ed25519 keypairs (RFC 8037),
					JWTs (RFC 7519), device authorization (RFC 8628), token introspection
					(RFC 7662), and JWK/JWKS (RFC 7517). It reuses OAuth mechanisms where
					they fit but is a standalone protocol — not an OAuth extension.
				</p>
				<p>
					MCP defines how agents talk to tools. Agent Auth defines how agents
					prove who they are and what they&apos;re allowed to do. Services with
					MCP servers can expose Agent Auth-backed capabilities through an
					adapter — the execute endpoint can proxy requests to MCP tools
					internally.
				</p>
			</div>

			<SectionDivider label="FAQ" />

			<div className="space-y-4 mb-4">
				{[
					{
						q: "How is this different from giving agents OAuth tokens?",
						a: "OAuth tokens give an agent the user's full identity — every agent behind the same client looks identical to the server. There's no way to scope, audit, or revoke one agent without affecting all of them. Agent Auth gives each agent its own cryptographic identity, individually-granted capabilities with constraints, a managed lifecycle, and a complete audit trail.",
					},
					{
						q: "How does this relate to MCP?",
						a: "MCP defines how agents communicate with tools (the transport layer). Agent Auth defines how agents prove their identity and what they're allowed to do (the auth layer). With MCP alone, agents use the user's credentials — there's no per-agent identity or permission control. You can use both together: MCP for tool communication, Agent Auth for identity and authorization.",
					},
					{
						q: "Do agents hold their own private keys?",
						a: "No. The client (MCP server, CLI, SDK) holds all private keys — both host and agent keys. The agent interacts with the client through tool calls. The client handles key generation, JWT signing, and protocol mechanics on the agent's behalf.",
					},
					{
						q: "What happens when an agent needs more permissions?",
						a: 'The agent calls request_capability with the additional capabilities it needs. The server creates "pending" grant rows. The user approves or denies each one independently through a device authorization flow or CIBA notification. The agent polls until resolved.',
					},
					{
						q: "Can I implement this without Better Auth?",
						a: "Yes. Agent Auth is an open protocol — Ed25519 keypairs, device authorization, signed JWTs, three tables. Better Auth ships a reference implementation that handles everything, but the protocol is designed to be implementable in any language or framework.",
					},
					{
						q: "What about key compromise?",
						a: "Agent private keys never traverse the wire — they can only leak from the client's local storage. If compromised: use host-authorized key rotation to immediately invalidate the old key, or revoke the agent entirely. Short TTLs and the three-clock lifecycle limit the window of exposure.",
					},
				].map((item) => (
					<details
						key={item.q}
						className="group border border-foreground/[0.15] bg-foreground/[0.03]"
					>
						<summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none">
							<span className="text-[13px] sm:text-sm font-medium text-foreground/80">
								{item.q}
							</span>
							<span className="text-foreground/35 text-xs font-mono ml-3 shrink-0 group-open:rotate-45 transition-transform">
								+
							</span>
						</summary>
						<div className="px-4 pb-3 text-[13px] sm:text-sm text-foreground/60 leading-[1.85]">
							{item.a}
						</div>
					</details>
				))}
			</div>

			<SectionDivider label="Read the Spec" />

			<div className="flex flex-wrap items-center gap-3 mb-8">
				<Link
					href="/spec"
					className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-foreground text-background text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity"
				>
					Full Protocol Specification
					<ArrowRight className="h-3.5 w-3.5" />
				</Link>
				<Link
					href="https://www.better-auth.com/docs"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.5 px-5 py-2.5 text-foreground/65 text-xs sm:text-sm font-medium hover:text-foreground/90 transition-colors"
				>
					Reference Implementation
				</Link>
				<Link
					href="https://github.com/better-auth/better-auth"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center gap-1.5 px-5 py-2.5 text-foreground/65 text-xs sm:text-sm font-medium hover:text-foreground/90 transition-colors"
				>
					View on GitHub
				</Link>
			</div>
		</>
	);
}

/* ─────────────────────────── MAIN EXPORT ─────────────────────────── */

export function LandingReadme({
	activeProduct,
}: {
	activeProduct: ProductView;
}) {
	return (
		<div className="relative max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 py-8 sm:py-10">
			<SpecContent />
		</div>
	);
}
