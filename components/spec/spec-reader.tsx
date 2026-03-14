"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { highlight } from "sugar-high";
import type { TocEntry } from "@/lib/spec";

function slugify(text: string) {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-");
}

function CodeBlock({
	children,
	className,
}: { children: string; className?: string }) {
	const lang = className?.replace("language-", "") || "";
	const html = highlight(children.trim());
	return (
		<pre className="spec-code" data-lang={lang}>
			<code dangerouslySetInnerHTML={{ __html: html }} />
		</pre>
	);
}

function SpecToc({
	toc,
	activeId,
	onNavigate,
}: {
	toc: TocEntry[];
	activeId: string;
	onNavigate: (id: string) => void;
}) {
	const topLevel = toc.filter((e) => e.level === 2);
	const activeRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}, [activeId]);

	return (
		<nav aria-label="Table of Contents">
			{topLevel.map((entry) => {
				const entryNum = entry.text.match(/^(\d+|[A-Z])\./)?.[1];
				const children = toc.filter(
					(e) =>
						e.level === 3 &&
						entryNum &&
						e.text.match(/^(\d+|[A-Z])\.\d/)?.[1] === entryNum,
				);

				const isChildActive = children.some((c) => activeId === c.id);
				const isSelfActive = activeId === entry.id;
				const isExpanded = (isSelfActive || isChildActive) && children.length > 0;

				return (
					<div key={entry.id} className="mb-0.5">
						<button
							ref={isSelfActive ? activeRef : undefined}
							type="button"
							onClick={() => onNavigate(entry.id)}
							className={`w-full text-left py-1.5 text-[12px] leading-snug transition-colors cursor-pointer ${
								isSelfActive
									? "text-foreground font-medium"
									: isChildActive
										? "text-foreground/55"
										: "text-foreground/30 hover:text-foreground/55"
							}`}
							style={{ fontFamily: "var(--font-content), Georgia, serif" }}
						>
							{entry.text}
						</button>
						{isExpanded && (
							<div className="ml-3 border-l border-foreground/8 pl-3 pb-1">
								{children.map((child) => {
									const isActive = activeId === child.id;
									return (
										<button
											ref={isActive ? activeRef : undefined}
											type="button"
											key={child.id}
											onClick={() => onNavigate(child.id)}
											className={`w-full text-left py-1 text-[11px] leading-snug transition-colors cursor-pointer ${
												isActive
													? "text-foreground/65"
													: "text-foreground/22 hover:text-foreground/45"
											}`}
											style={{ fontFamily: "var(--font-content), Georgia, serif" }}
										>
											{child.text}
										</button>
									);
								})}
							</div>
						)}
					</div>
				);
			})}
		</nav>
	);
}

export function SpecReader({
	content,
	toc,
}: {
	content: string;
	toc: TocEntry[];
}) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [activeId, setActiveId] = useState(toc[0]?.id || "");

	useEffect(() => {
		const container = scrollRef.current;
		if (!container) return;

		const headings = container.querySelectorAll<HTMLElement>(
			"h2[id], h3[id], h4[id]",
		);

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort(
						(a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
					);
				if (visible[0]) {
					setActiveId(visible[0].target.id);
				}
			},
			{ root: container, rootMargin: "-20px 0px -65% 0px", threshold: 0 },
		);

		for (const h of headings) observer.observe(h);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (window.location.hash) {
			const id = window.location.hash.slice(1);
			requestAnimationFrame(() => scrollToId(id, "auto"));
		}
	}, []);

	const scrollToId = (id: string, behavior: ScrollBehavior = "smooth") => {
		const container = scrollRef.current;
		const el = document.getElementById(id);
		if (!container || !el) return;

		const containerRect = container.getBoundingClientRect();
		const elRect = el.getBoundingClientRect();
		const offset = elRect.top - containerRect.top + container.scrollTop - 24;
		container.scrollTo({ top: offset, behavior });
		setActiveId(id);
		window.history.replaceState(null, "", `#${id}`);
	};

	return (
		<div className="flex flex-1 min-h-0">
			{/* Reader */}
			<div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
				<article className="mx-auto max-w-4xl px-5 sm:px-8 py-14 sm:py-20">
					<div className="spec-content">
						<ReactMarkdown
							remarkPlugins={[remarkGfm]}
							components={{
								h1: ({ children }) => {
									const text = String(children);
									const id = slugify(text);
									return (
										<h1 id={id} className="spec-h1">
											{children}
										</h1>
									);
								},
								h2: ({ children }) => {
									const text = String(children);
									const id = slugify(text);
									return (
										<h2 id={id} className="spec-h2">
											{children}
										</h2>
									);
								},
								h3: ({ children }) => {
									const text = String(children);
									const id = slugify(text);
									return (
										<h3 id={id} className="spec-h3">
											{children}
										</h3>
									);
								},
								h4: ({ children }) => {
									const text = String(children);
									const id = slugify(text);
									return (
										<h4 id={id} className="spec-h4">
											{children}
										</h4>
									);
								},
								code: ({ children, className }) => {
									if (className?.startsWith("language-")) {
										return (
											<CodeBlock className={className}>
												{String(children)}
											</CodeBlock>
										);
									}
									return (
										<code className="spec-inline-code">{children}</code>
									);
								},
								pre: ({ children }) => <>{children}</>,
								table: ({ children }) => (
									<div className="overflow-x-auto my-4">
										<table className="spec-table">{children}</table>
									</div>
								),
								a: ({ href, children }) => (
									<a
										href={href}
										className="spec-link"
										target={
											href?.startsWith("http") ? "_blank" : undefined
										}
										rel={
											href?.startsWith("http")
												? "noopener noreferrer"
												: undefined
										}
									>
										{children}
									</a>
								),
							}}
						>
							{content}
						</ReactMarkdown>
					</div>
				</article>
			</div>

			{/* TOC Sidebar */}
			<aside className="hidden lg:block w-56 xl:w-64 shrink-0 overflow-y-auto py-14 sm:py-20 pr-5 pl-6 border-l border-foreground/6">
				<div className="mb-5">
					<span
						className="text-[11px] uppercase tracking-[0.12em] text-foreground/30 font-medium"
						style={{ fontFamily: "var(--font-display), serif" }}
					>
						Contents
					</span>
				</div>
				<SpecToc toc={toc} activeId={activeId} onNavigate={scrollToId} />
			</aside>
		</div>
	);
}
