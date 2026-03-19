"use client";

import { useState } from "react";
import { Check, Copy, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
	{
		id: "cli",
		label: "CLI",
		command: "npx auth ai",
	},
	{
		id: "npm",
		label: "npm",
		command: "npm install @auth/agent",
	},
	{
		id: "pnpm",
		label: "pnpm",
		command: "pnpm add @auth/agent",
	},
] as const;

export function GetStartedBlock() {
	const [activeTab, setActiveTab] = useState<string>("cli");
	const [copied, setCopied] = useState(false);

	const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

	const handleCopy = () => {
		navigator.clipboard.writeText(active.command);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="not-prose mb-8 border border-fd-border rounded-lg overflow-hidden bg-fd-background">
			<div className="flex items-center border-b border-fd-border">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => {
							setActiveTab(tab.id);
							setCopied(false);
						}}
						className={cn(
							"px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer",
							tab.id === activeTab
								? "text-fd-foreground bg-fd-secondary/50"
								: "text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-secondary/30",
						)}
					>
						{tab.label}
					</button>
				))}
			</div>
			<div className="flex items-center justify-between gap-4 px-4 py-3.5 bg-fd-secondary/30">
				<div className="flex items-center gap-2 min-w-0">
					<ChevronRight className="w-3.5 h-3.5 text-fd-muted-foreground shrink-0" />
					<code className="text-sm font-mono text-fd-foreground truncate">
						{active.command}
					</code>
				</div>
				<button
					type="button"
					onClick={handleCopy}
					className="shrink-0 p-1.5 text-fd-muted-foreground hover:text-fd-foreground transition-colors cursor-pointer"
				>
					{copied ? (
						<Check className="w-4 h-4 text-emerald-500" />
					) : (
						<Copy className="w-4 h-4" />
					)}
				</button>
			</div>
		</div>
	);
}
