"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { ChatClient } from "@/app/(dashboard)/dashboard/[orgSlug]/chat/chat-client";
import { AgentBotIcon } from "@/components/icons/agent-bot";
import { cn } from "@/lib/utils";

interface ChatDialogContextValue {
	open: boolean;
	openChat: () => void;
	closeChat: () => void;
}

const ChatDialogContext = createContext<ChatDialogContextValue>({
	open: false,
	openChat: () => {},
	closeChat: () => {},
});

export function useChatDialog() {
	return useContext(ChatDialogContext);
}

export function ChatDialogProvider({
	orgSlug,
	children,
}: {
	orgSlug: string;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(false);

	const openChat = useCallback(() => setOpen(true), []);
	const closeChat = useCallback(() => setOpen(false), []);

	return (
		<ChatDialogContext.Provider value={{ open, openChat, closeChat }}>
			{children}

			{/* Always-mounted dialog — visibility toggled via CSS */}
			<div
				className={cn(
					"fixed inset-0 z-50 flex items-center justify-center transition-all duration-200",
					open
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none",
				)}
			>
				{/* Backdrop */}
				<div
					className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
					onClick={closeChat}
				/>

				{/* Dialog panel */}
				<div
					className={cn(
						"relative z-10 w-[calc(100vw-8rem)] max-w-4xl h-[calc(100dvh-6rem)] bg-background border border-border/60 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-200",
						open ? "scale-100" : "scale-95",
					)}
				>
					{/* Header */}
					<div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40 shrink-0">
						<div className="flex items-center gap-3">
							<div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground/[0.06]">
								<AgentBotIcon className="h-4 w-4 text-muted-foreground/70" />
							</div>
							<div>
								<p className="text-sm font-medium leading-tight">Agent Chat</p>
								<p className="text-[10px] text-muted-foreground/60 leading-tight">
									Test your connected tools and capabilities
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={closeChat}
							className={cn(
								"h-7 w-7 inline-flex items-center justify-center rounded-md",
								"text-muted-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] transition-colors cursor-pointer",
							)}
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					{/* Chat body — always mounted */}
					<div className="flex-1 min-h-0 px-5">
						<ChatClient
							orgSlug={orgSlug}
							className="h-full py-0 pt-2 pb-3"
							visible={open}
						/>
					</div>
				</div>
			</div>
		</ChatDialogContext.Provider>
	);
}
