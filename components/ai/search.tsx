"use client";

import {
	type ComponentProps,
	createContext,
	type ReactNode,
	type SyntheticEvent,
	use,
	useEffect,
	useEffectEvent,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	Loader2,
	MessageCircleIcon,
	RefreshCw,
	SearchIcon,
	Send,
	X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type UIMessage, useChat, type UseChatHelpers } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Context = createContext<{
	open: boolean;
	setOpen: (open: boolean) => void;
	chat: UseChatHelpers<UIMessage>;
} | null>(null);

function useAISearchContext() {
	return use(Context)!;
}

function useChatContext() {
	return use(Context)!.chat;
}

export function AISearch({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const chat = useChat({
		id: "search",
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
	});

	return (
		<Context
			value={useMemo(() => ({ chat, open, setOpen }), [chat, open])}
		>
			{children}
		</Context>
	);
}

export function AISearchTrigger({
	position = "default",
	className,
	hideOnPaths,
	...props
}: ComponentProps<"button"> & { position?: "default" | "float"; hideOnPaths?: string[] }) {
	const { open, setOpen } = useAISearchContext();
	const [hidden, setHidden] = useState(false);

	useEffect(() => {
		if (!hideOnPaths?.length) return;
		setHidden(hideOnPaths.some((p) => window.location.pathname.startsWith(p)));
	}, [hideOnPaths]);

	if (hidden) return null;

	return (
		<button
			type="button"
			data-state={open ? "open" : "closed"}
			className={cn(
				position === "float" && [
					"fixed bottom-4 end-4 shadow-lg z-20 transition-[translate,opacity]",
					open && "translate-y-10 opacity-0",
				],
				className,
			)}
			onClick={() => setOpen(!open)}
			{...props}
		>
			{props.children}
		</button>
	);
}

export function AISearchPanel() {
	const { open, setOpen } = useAISearchContext();
	useHotKey();

	if (!open) return null;

	return (
		<>
			{/* Mobile overlay */}
			<div
				className="fixed inset-0 z-50 bg-fd-background/60 backdrop-blur-sm lg:hidden"
				onClick={() => setOpen(false)}
			/>

			{/* Panel */}
			<div
				className={cn(
					"z-50 bg-fd-card text-fd-card-foreground border border-fd-border",
					"fixed inset-x-3 top-4 bottom-4 rounded-xl shadow-2xl",
					"lg:fixed lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[400px] lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l",
				)}
			>
				<div className="flex flex-col size-full p-3">
					<PanelHeader />
					<PanelMessages className="flex-1" />
					<div className="rounded-xl border border-fd-border bg-fd-secondary shadow-sm">
						<PanelInput />
						<div className="flex items-center gap-1.5 p-1 empty:hidden">
							<PanelActions />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

function PanelHeader() {
	const { setOpen } = useAISearchContext();

	return (
		<div className="flex items-start gap-2 border border-fd-border rounded-xl bg-fd-secondary p-3 mb-2">
			<div className="flex-1">
				<p className="text-sm font-medium mb-1">Ask AI</p>
				<p className="text-xs text-fd-muted-foreground">
					Ask anything about Agent Auth Protocol.
				</p>
			</div>
			<button
				type="button"
				aria-label="Close"
				className="text-fd-muted-foreground hover:text-fd-foreground transition-colors p-1"
				onClick={() => setOpen(false)}
			>
				<X className="size-4" />
			</button>
		</div>
	);
}

function PanelActions() {
	const { messages, status, setMessages, regenerate } = useChatContext();
	const isLoading = status === "streaming";

	if (messages.length === 0) return null;

	return (
		<>
			{!isLoading && messages.at(-1)?.role === "assistant" && (
				<button
					type="button"
					className="inline-flex items-center gap-1.5 rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors"
					onClick={() => regenerate()}
				>
					<RefreshCw className="size-3" />
					Retry
				</button>
			)}
			<button
				type="button"
				className="inline-flex items-center rounded-full border border-fd-border bg-fd-card px-3 py-1 text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors"
				onClick={() => setMessages([])}
			>
				Clear
			</button>
		</>
	);
}

function PanelInput() {
	const { status, sendMessage, stop } = useChatContext();
	const [input, setInput] = useState("");
	const isLoading = status === "streaming" || status === "submitted";

	const onSubmit = (e?: SyntheticEvent) => {
		e?.preventDefault();
		if (!input.trim()) return;
		void sendMessage({ text: input });
		setInput("");
	};

	return (
		<form className="flex items-start pe-2" onSubmit={onSubmit}>
			<textarea
				value={input}
				placeholder={isLoading ? "AI is answering..." : "Ask a question"}
				autoFocus
				className="flex-1 resize-none bg-transparent p-3 text-sm placeholder:text-fd-muted-foreground focus-visible:outline-none"
				disabled={isLoading}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={(e) => {
					if (!e.shiftKey && e.key === "Enter") {
						onSubmit(e);
					}
				}}
			/>
			{isLoading ? (
				<button
					type="button"
					className="mt-2 inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card px-3 py-1.5 text-xs transition-colors"
					onClick={stop}
				>
					<Loader2 className="size-3 animate-spin" />
					Stop
				</button>
			) : (
				<button
					type="submit"
					className="mt-2 inline-flex items-center rounded-full bg-fd-foreground px-3 py-1.5 text-fd-background transition-colors disabled:opacity-30"
					disabled={input.length === 0}
				>
					<Send className="size-3" />
				</button>
			)}
		</form>
	);
}

function PanelMessages({
	className,
}: { className?: string }) {
	const { messages } = useChatContext();
	const filtered = messages.filter((msg) => msg.role !== "system");
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const observer = new ResizeObserver(() => {
			containerRef.current?.scrollTo({
				top: containerRef.current.scrollHeight,
				behavior: "instant",
			});
		});

		const el = containerRef.current.firstElementChild;
		if (el) observer.observe(el);

		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn("overflow-y-auto min-w-0 py-4", className)}
			style={{
				maskImage:
					"linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)",
			}}
		>
			{filtered.length === 0 ? (
				<div className="size-full flex flex-col items-center justify-center text-center gap-2 text-sm text-fd-muted-foreground/80">
					<MessageCircleIcon
						fill="currentColor"
						stroke="none"
						className="size-5"
					/>
					<p>Ask anything about Agent Auth Protocol.</p>
				</div>
			) : (
				<div className="flex flex-col px-3 gap-4">
					{filtered.map((msg) => (
						<Message key={msg.id} message={msg} />
					))}
				</div>
			)}
		</div>
	);
}

const roleName: Record<string, string> = {
	user: "you",
	assistant: "agent-auth",
};

interface ToolCall {
	toolCallId: string;
	state: string;
	output?: unknown;
	errorText?: string;
}

function Message({
	message,
	...props
}: { message: UIMessage } & ComponentProps<"div">) {
	let markdown = "";
	const searchCalls: ToolCall[] = [];

	for (const part of message.parts ?? []) {
		if (part.type === "text") {
			markdown += part.text;
			continue;
		}

		if (part.type === "tool-invocation") {
			const p = part as unknown as { toolInvocation: ToolCall & { toolName: string } };
			if (p.toolInvocation?.toolName === "search") {
				searchCalls.push(p.toolInvocation);
			}
		}
	}

	return (
		<div {...props}>
			<p
				className={cn(
					"mb-1 text-xs font-medium text-fd-muted-foreground",
					message.role === "assistant" && "text-fd-foreground",
				)}
			>
				{roleName[message.role] ?? "unknown"}
			</p>
			<div className="prose prose-sm prose-fd max-w-none text-sm">
				<ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
			</div>

			{searchCalls.map((call) => (
				<div
					key={call.toolCallId}
					className="flex items-center gap-2 mt-2 rounded-lg border border-fd-border bg-fd-secondary text-fd-muted-foreground text-xs p-2"
				>
					<SearchIcon className="size-3.5" />
					{call.state === "error" ? (
						<p className="text-red-500">Search failed</p>
					) : (
						<p>
							{call.state === "result"
								? `${Array.isArray(call.output) ? call.output.length : 0} results`
								: "Searching…"}
						</p>
					)}
				</div>
			))}
		</div>
	);
}

function useHotKey() {
	const { open, setOpen } = useAISearchContext();

	const onKeyPress = useEffectEvent((e: KeyboardEvent) => {
		if (e.key === "Escape" && open) {
			setOpen(false);
			e.preventDefault();
		}

		if (e.key === "/" && (e.metaKey || e.ctrlKey) && !open) {
			setOpen(true);
			e.preventDefault();
		}
	});

	useEffect(() => {
		window.addEventListener("keydown", onKeyPress);
		return () => window.removeEventListener("keydown", onKeyPress);
	}, []);
}
