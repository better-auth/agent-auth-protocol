"use client";

import { useState } from "react";
import { Check, Copy, ChevronRight } from "lucide-react";

const command = "pnpm add @auth/agent";

export function GetStartedBlock() {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(command);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="not-prose mb-8 border border-fd-border rounded-lg overflow-hidden bg-fd-background">
			<div className="flex items-center justify-between gap-4 px-4 py-3.5 bg-fd-secondary/30">
				<div className="flex items-center gap-2 min-w-0">
					<ChevronRight className="w-3.5 h-3.5 text-fd-muted-foreground shrink-0" />
					<code className="text-sm font-mono text-fd-foreground truncate">
						{command}
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
