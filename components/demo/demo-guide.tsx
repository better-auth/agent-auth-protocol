"use client";

import { useState } from "react";
import { Check, Copy, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function GmailIcon({ className }: { className?: string }) {
	return (
<svg xmlns="http://www.w3.org/2000/svg" width="1.33em" height="1em" className={className} viewBox="0 0 256 193">
<path fill="#4285F4" d="M58.182 192.05V93.14L27.507 65.077L0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455z" /><path fill="#34A853" d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 17.837l-27.026 25.798z" /><path fill="#EA4335" d="m58.182 93.14l-4.174-38.647l4.174-36.989L128 69.868l69.818-52.364l4.669 34.992l-4.669 40.644L128 145.504z" /><path fill="#FBBC04" d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-41.89-20.945z" /><path fill="#C5221F" d="m0 49.504l26.759 20.07L58.182 93.14V17.504L41.89 5.286C24.61-7.66 0 4.646 0 26.23z" /></svg>
	);	
}

type AgentType = "chatgpt" | "claude" | "claude-code" | "opencode" | null;

type AgentCategory = "hosted" | "local";

function getAgentCategory(agent: AgentType): AgentCategory | null {
	if (!agent) return null;
	if (agent === "chatgpt" || agent === "claude") return "hosted";
	return "local";
}

const AGENTS: {
	id: AgentType & string;
	name: string;
	description: string;
	category: AgentCategory;
}[] = [
	{
		id: "chatgpt",
		name: "ChatGPT",
		description: "OpenAI's hosted assistant",
		category: "hosted",
	},
	{
		id: "claude",
		name: "Claude",
		description: "Anthropic's hosted assistant",
		category: "hosted",
	},
	{
		id: "claude-code",
		name: "Claude Code",
		description: "Anthropic's coding agent (CLI)",
		category: "local",
	},
	{
		id: "opencode",
		name: "OpenCode",
		description: "Open-source coding agent",
		category: "local",
	},
];

const MCP_SERVER_URL = "https://gmail-demo.agent-auth.dev";

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	return (
		<button
			type="button"
			onClick={() => {
				navigator.clipboard.writeText(text);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}}
			className="absolute top-2.5 right-2.5 p-1.5 text-foreground/30 hover:text-foreground/60 transition-colors cursor-pointer"
			aria-label="Copy to clipboard"
		>
			{copied ? (
				<Check className="w-3.5 h-3.5 text-emerald-500" />
			) : (
				<Copy className="w-3.5 h-3.5" />
			)}
		</button>
	);
}

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
	return (
		<div className="relative group">
			<CopyButton text={code} />
			<pre className="bg-foreground/3 border border-foreground/8 p-4 pr-10 overflow-x-auto font-mono text-[12.5px] leading-[1.7] text-foreground/60">
				<code>{code}</code>
			</pre>
		</div>
	);
}

function PromptBlock({
	prompt,
	label,
}: {
	prompt: string;
	label?: string;
}) {
	const [copied, setCopied] = useState(false);

	return (
		<div
			className="relative border border-foreground/10 bg-foreground/2 cursor-pointer group transition-colors hover:bg-foreground/4"
			onClick={() => {
				navigator.clipboard.writeText(prompt);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			}}
		>
			{label && (
				<div className="px-4 pt-3 pb-0">
					<span className="text-[9px] font-mono uppercase tracking-[0.14em] text-foreground/35">
						{label}
					</span>
				</div>
			)}
			<div className="px-4 py-3 flex items-start gap-3">
				<ChevronRight className="w-4 h-4 text-foreground/25 shrink-0 mt-0.5" />
				<p
					className="text-[15px] text-foreground/70 leading-relaxed flex-1"
					style={{ fontFamily: "var(--font-content), Georgia, serif" }}
				>
					{prompt}
				</p>
				<span className="shrink-0 mt-0.5">
					{copied ? (
						<Check className="w-3.5 h-3.5 text-emerald-500" />
					) : (
						<Copy className="w-3.5 h-3.5 text-foreground/20 group-hover:text-foreground/40 transition-colors" />
					)}
				</span>
			</div>
		</div>
	);
}

function StepNumber({ n, active }: { n: number; active: boolean }) {
	return (
		<span
			className={`inline-flex items-center justify-center w-6 h-6 text-[11px] font-mono border shrink-0 transition-colors ${
				active
					? "border-foreground/30 text-foreground/80 bg-foreground/5"
					: "border-foreground/10 text-foreground/30"
			}`}
		>
			{n}
		</span>
	);
}

function SectionLabel({ label }: { label: string }) {
	return (
		<div className="flex items-center gap-3 mb-1">
			<span className="text-[10px] font-mono uppercase tracking-[0.14em] text-foreground/40">
				{label}
			</span>
			<div className="h-px flex-1 bg-linear-to-r from-foreground/8 to-transparent" />
		</div>
	);
}

function getIntegrationInstructions(agent: AgentType) {
	switch (agent) {
		case "chatgpt":
			return {
				title: "Connect ChatGPT to the Gmail proxy",
				description:
					"Add the Agent Auth Gmail proxy as a remote MCP server in ChatGPT. Go to Settings, then add a new MCP connection.",
				steps: [
					"Open ChatGPT and go to Settings → MCP Tools",
					"Click \"Add MCP Tool\" and enter the server URL below",
					"Save and start a new conversation",
				],
				config: MCP_SERVER_URL,
				configLabel: "MCP Server URL",
				configLang: "text" as const,
			};
		case "claude":
			return {
				title: "Connect Claude to the Gmail proxy",
				description:
					"Add the Agent Auth Gmail proxy as a remote MCP integration in Claude. Navigate to your integrations settings.",
				steps: [
					"Open Claude and go to Settings → Integrations",
					"Click \"Add Integration\" → MCP Server",
					"Enter the server URL below and save",
				],
				config: MCP_SERVER_URL,
				configLabel: "MCP Server URL",
				configLang: "text" as const,
			};
		case "claude-code":
			return {
				title: "Connect Claude Code to the Gmail proxy",
				description:
					"Add the Gmail proxy as a remote MCP server in your Claude Code configuration.",
				steps: [
					"Open your terminal",
					"Run the command below to add the MCP server",
					"Start Claude Code — the Gmail tools will be available",
				],
				config: `claude mcp add gmail-proxy ${MCP_SERVER_URL} --transport sse`,
				configLabel: "Run in your terminal",
				configLang: "bash" as const,
			};
		case "opencode":
			return {
				title: "Connect OpenCode to the Gmail proxy",
				description:
					"Add the Gmail proxy to your OpenCode MCP server configuration file.",
				steps: [
					"Open your opencode.json config file",
					"Add the MCP server configuration below",
					"Restart OpenCode — the Gmail tools will be available",
				],
				config: JSON.stringify(
					{
						mcp: {
							"gmail-proxy": {
								type: "sse",
								url: MCP_SERVER_URL,
							},
						},
					},
					null,
					2,
				),
				configLabel: "opencode.json",
				configLang: "json" as const,
			};
		default:
			return null;
	}
}

export function DemoGuide() {
	const [selectedAgent, setSelectedAgent] = useState<AgentType>(null);
	const [currentStep, setCurrentStep] = useState(1);

	const agentCategory = getAgentCategory(selectedAgent);
	const instructions = getIntegrationInstructions(selectedAgent);

	const canAdvance = (step: number) => {
		if (step === 1) return selectedAgent !== null;
		if (step === 2) return selectedAgent !== null;
		return true;
	};

	return (
		<div>
			{/* Header */}
			<div className="mb-10">
				<h1
					className="text-2xl sm:text-3xl tracking-[-0.02em] font-semibold mb-4"
					style={{ fontFamily: "var(--font-display), serif" }}
				>
					Try Agent Auth
				</h1>
				<p
					className="text-[17px] sm:text-[18px] text-foreground/65 leading-[1.8] max-w-2xl"
					style={{ fontFamily: "var(--font-content), Georgia, serif" }}
				>
					Through this demo, you'll use an Agent Auth proxy server for{" "}
					<span className="inline-flex items-start gap-1 mx-1">
						<GmailIcon className="size-4" />		
					</span>
					Gmail. You{"'"}ll connect an agent to your email, approve specific
					capabilities, and see how the agent can request additional
					permissions as needed — all through the protocol{"'"}s consent and
					authorization flow.
				</p>
			</div>

			{/* Steps */}
			<div className="space-y-10">
				{/* ── Step 1: Choose agent ── */}
				<section>
					<div className="flex items-center gap-3 mb-5">
						<StepNumber n={1} active={currentStep >= 1} />
						<h2
							className="text-lg font-medium tracking-tight"
							style={{ fontFamily: "var(--font-display), serif" }}
						>
							Choose your agent
						</h2>
					</div>

					<p
						className="text-[15px] text-foreground/55 leading-relaxed mb-5 ml-9"
						style={{ fontFamily: "var(--font-content), Georgia, serif" }}
					>
						Pick the AI agent you want to integrate with. Hosted agents
						connect through a remote MCP server; local agents connect
						directly.
					</p>

					<div className="ml-9 grid grid-cols-1 sm:grid-cols-2 gap-px bg-foreground/8 border border-foreground/8 overflow-hidden">
						{AGENTS.map((agent) => {
							const isSelected = selectedAgent === agent.id;
							return (
								<button
									key={agent.id}
									type="button"
									onClick={() => {
										setSelectedAgent(agent.id as AgentType);
										setCurrentStep(2);
									}}
									className={`relative text-left p-4 transition-colors cursor-pointer ${
										isSelected
											? "bg-foreground/6"
											: "bg-background hover:bg-foreground/3"
									}`}
								>
									{isSelected && (
										<span className="absolute top-3 right-3">
											<Check className="w-3.5 h-3.5 text-foreground/50" />
										</span>
									)}
									<div className="flex items-center gap-2 mb-1">
										<span className="text-sm font-medium text-foreground/80">
											{agent.name}
										</span>
										<span className="text-[9px] font-mono uppercase tracking-wider text-foreground/30 border border-foreground/10 px-1.5 py-0.5">
											{agent.category}
										</span>
									</div>
									<span className="text-[13px] text-foreground/40">
										{agent.description}
									</span>
								</button>
							);
						})}
					</div>
				</section>

				{/* ── Step 2: Integrate ── */}
				<AnimatePresence>
					{currentStep >= 2 && instructions && (
						<motion.section
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -4 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
						>
							<div className="flex items-center gap-3 mb-5">
								<StepNumber n={2} active={currentStep >= 2} />
								<h2
									className="text-lg font-medium tracking-tight"
									style={{
										fontFamily: "var(--font-display), serif",
									}}
								>
									{instructions.title}
								</h2>
							</div>

							<div className="ml-9 space-y-5">
								<p
									className="text-[15px] text-foreground/55 leading-relaxed"
									style={{
										fontFamily:
											"var(--font-content), Georgia, serif",
									}}
								>
									{instructions.description}
								</p>

								<ol className="space-y-2.5">
									{instructions.steps.map((step, i) => (
										<li
											key={i}
											className="flex items-start gap-3 text-[14px] text-foreground/60"
										>
											<span className="text-[11px] font-mono text-foreground/30 mt-0.5 shrink-0 w-4 text-right">
												{i + 1}.
											</span>
											<span
												style={{
													fontFamily:
														"var(--font-content), Georgia, serif",
												}}
											>
												{step}
											</span>
										</li>
									))}
								</ol>

								<div>
									<SectionLabel
										label={instructions.configLabel}
									/>
									<CodeBlock
										code={instructions.config}
										lang={instructions.configLang}
									/>
								</div>

								{currentStep === 2 && (
									<button
										type="button"
										onClick={() => setCurrentStep(3)}
										className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 border border-foreground/10 text-[12px] font-mono uppercase tracking-wider text-foreground/60 hover:text-foreground/80 hover:bg-foreground/8 transition-colors cursor-pointer"
									>
										I{"'"}ve connected the server
										<ArrowRight className="w-3 h-3" />
									</button>
								)}
							</div>
						</motion.section>
					)}
				</AnimatePresence>

				{/* ── Step 3: First prompt ── */}
				<AnimatePresence>
					{currentStep >= 3 && (
						<motion.section
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -4 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
						>
							<div className="flex items-center gap-3 mb-5">
								<StepNumber n={3} active={currentStep >= 3} />
								<h2
									className="text-lg font-medium tracking-tight"
									style={{
										fontFamily: "var(--font-display), serif",
									}}
								>
									Read your emails
								</h2>
							</div>

							<div className="ml-9 space-y-5">
								<p
									className="text-[15px] text-foreground/55 leading-relaxed"
									style={{
										fontFamily:
											"var(--font-content), Georgia, serif",
									}}
								>
									Send the following prompt to your agent. This
									will trigger the Agent Auth consent flow — the
									agent will ask you to sign in with your Google
									account and approve the{" "}
									<code className="text-[13px] font-mono px-1 py-0.5 bg-foreground/5 border border-foreground/8">
										read:email
									</code>{" "}
									capability.
								</p>

								<PromptBlock
									label="Copy this prompt"
									prompt="Show me the top 5 most important emails I received in the last week."
								/>

								<div className="border border-foreground/8 bg-foreground/2 p-4">
									<SectionLabel label="What happens next" />
									<div className="space-y-3 mt-3">
										{[
											"The agent calls the Gmail proxy's MCP tool",
											"The proxy returns an authorization URL",
											"You sign in with Google and see the Agent Auth consent screen",
											"You approve the read:email capability for this agent",
											"The agent receives access and shows your emails",
										].map((step, i) => (
											<div
												key={i}
												className="flex items-start gap-3"
											>
												<span className="w-1 h-1 rounded-full bg-foreground/20 mt-2 shrink-0" />
												<span
													className="text-[14px] text-foreground/50 leading-relaxed"
													style={{
														fontFamily:
															"var(--font-content), Georgia, serif",
													}}
												>
													{step}
												</span>
											</div>
										))}
									</div>
								</div>

								{currentStep === 3 && (
									<button
										type="button"
										onClick={() => setCurrentStep(4)}
										className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 border border-foreground/10 text-[12px] font-mono uppercase tracking-wider text-foreground/60 hover:text-foreground/80 hover:bg-foreground/8 transition-colors cursor-pointer"
									>
										I{"'"}ve approved and seen my emails
										<ArrowRight className="w-3 h-3" />
									</button>
								)}
							</div>
						</motion.section>
					)}
				</AnimatePresence>

				{/* ── Step 4: Send an email ── */}
				<AnimatePresence>
					{currentStep >= 4 && (
						<motion.section
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -4 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
						>
							<div className="flex items-center gap-3 mb-5">
								<StepNumber n={4} active={currentStep >= 4} />
								<h2
									className="text-lg font-medium tracking-tight"
									style={{
										fontFamily: "var(--font-display), serif",
									}}
								>
									Capability escalation
								</h2>
							</div>

							<div className="ml-9 space-y-5">
								<p
									className="text-[15px] text-foreground/55 leading-relaxed"
									style={{
										fontFamily:
											"var(--font-content), Georgia, serif",
									}}
								>
									Now ask the agent to do something it doesn{"'"}t
									have permission for yet — sending an email. This
									demonstrates how Agent Auth handles capability
									escalation: the agent will request the{" "}
									<code className="text-[13px] font-mono px-1 py-0.5 bg-foreground/5 border border-foreground/8">
										send:email
									</code>{" "}
									capability, and you{"'"}ll see a new approval
									prompt.
								</p>

								<PromptBlock
									label="Copy this prompt"
									prompt='Send an email to agent@better-auth.com with the subject "Hello from Agent Auth" and the message "Hey, I just tried Agent Auth!"'
								/>

								<div className="border border-foreground/8 bg-foreground/2 p-4">
									<SectionLabel label="What happens next" />
									<div className="space-y-3 mt-3">
										{[
											"The agent attempts to call the send email tool",
											"The proxy detects the agent lacks send:email capability",
											"A new consent screen appears asking you to approve sending",
											"You approve — the agent sends the email on your behalf",
											"You can verify the email was sent in your Gmail sent folder",
										].map((step, i) => (
											<div
												key={i}
												className="flex items-start gap-3"
											>
												<span className="w-1 h-1 rounded-full bg-foreground/20 mt-2 shrink-0" />
												<span
													className="text-[14px] text-foreground/50 leading-relaxed"
													style={{
														fontFamily:
															"var(--font-content), Georgia, serif",
													}}
												>
													{step}
												</span>
											</div>
										))}
									</div>
								</div>
							</div>
						</motion.section>
					)}
				</AnimatePresence>

				{/* ── What you just saw ── */}
				<AnimatePresence>
					{currentStep >= 4 && (
						<motion.section
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.25,
								ease: "easeOut",
								delay: 0.1,
							}}
						>
							<div className="border-t border-foreground/8 pt-10 mt-12">
								<h2
									className="text-lg font-medium tracking-tight mb-4"
									style={{
										fontFamily: "var(--font-display), serif",
									}}
								>
									What you just saw
								</h2>
								<div
									className="text-[15.5px] text-foreground/55 leading-[1.85] space-y-4"
									style={{
										fontFamily:
											"var(--font-content), Georgia, serif",
									}}
								>
									<p>
										The agent started with zero permissions. It
										requested capabilities as it needed them, and
										you approved each one individually. At no
										point did the agent have broad access to your
										account — it only received the specific
										capabilities you consented to.
									</p>
									<p>
										This is the core of Agent Auth: per-agent
										identity, capability-based authorization, and
										progressive consent. The proxy server can
										revoke any capability at any time, and every
										action traces back to a specific agent.
									</p>
								</div>

								<div className="mt-8 flex flex-wrap gap-3">
									<a
										href="/docs"
										className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-[12px] font-mono uppercase tracking-wider transition-colors hover:bg-primary/90"
									>
										Read the docs
										<ArrowRight className="w-3 h-3" />
									</a>
									<a
										href="/specification"
										className="inline-flex items-center gap-2 px-4 py-2 border border-foreground/10 text-[12px] font-mono uppercase tracking-wider text-foreground/60 hover:text-foreground/80 hover:bg-foreground/5 transition-colors"
									>
										Read the spec
									</a>
								</div>
							</div>
						</motion.section>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
