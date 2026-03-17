"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AnchorProvider,
  ScrollProvider,
  TOCItem,
  useActiveAnchor,
  type TOCItemType,
} from "fumadocs-core/toc";
import type { TocEntry } from "@/lib/spec";
import { Mermaid } from "@/components/mermaid";
import { VersionSelect } from "@/components/spec/version-select";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function isSectionChild(parentText: string, childText: string): boolean {
  const parentNum = parentText.match(/^(\d+|[A-Z])\./)?.[1];
  if (!parentNum) return false;
  const childNum = childText.match(/^(\d+|[A-Z])\.\d/)?.[1];
  return parentNum === childNum;
}

function isSubChild(parentText: string, childText: string): boolean {
  const parentMatch = parentText.match(/^((\d+|[A-Z])\.\d+)/);
  if (!parentMatch) return false;
  return childText.startsWith(`${parentMatch[1]}.`);
}

function tocEntriesToItems(toc: TocEntry[]): TOCItemType[] {
  return toc.map((e) => ({
    title: e.text,
    url: `#${e.id}`,
    depth: e.level,
  }));
}

function SpecToc({
  toc,
  onNavigate,
}: {
  toc: TocEntry[];
  onNavigate: (id: string) => void;
}) {
  const topLevel = toc.filter((e) => e.level === 2);
  const activeAnchor = useActiveAnchor();
  const scrollRef = useRef<HTMLDivElement>(null);

  function getAncestorId(id: string, level: number): string | null {
    // Walk backwards through toc to find parent at given level
    const idx = toc.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    for (let i = idx; i >= 0; i--) {
      if (toc[i].level === level) return toc[i].id;
    }
    return null;
  }

  const activeH2 = activeAnchor ? getAncestorId(activeAnchor, 2) : null;
  const activeH3 = activeAnchor ? getAncestorId(activeAnchor, 3) : null;

  return (
    <ScrollProvider containerRef={scrollRef}>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto [scrollbar-width:none] min-h-0"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, white 16px, white calc(100% - 16px), transparent)",
        }}
      >
        <nav aria-label="Table of Contents">
          {topLevel.map((entry) => {
            const children = toc.filter(
              (e) => e.level === 3 && isSectionChild(entry.text, e.text),
            );
            const isGroupActive = activeH2 === entry.id;

            return (
              <div key={entry.id} className="mb-0.5">
                <TOCItem
                  href={`#${entry.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(entry.id);
                  }}
                  className="block w-full text-left py-1.5 text-[15px] leading-snug cursor-pointer text-foreground/60 hover:text-foreground/80 data-[active=true]:text-foreground data-[active=true]:font-medium"
                  style={{ fontFamily: "var(--font-content), Georgia, serif" }}
                >
                  {entry.text}
                </TOCItem>
                {isGroupActive && children.length > 0 && (
                  <div className="ml-3 border-l border-foreground/8 pl-3 pb-1">
                    {children.map((child) => {
                      const grandchildren = toc.filter(
                        (e) => e.level === 4 && isSubChild(child.text, e.text),
                      );
                      const isChildGroupActive = activeH3 === child.id;

                      return (
                        <div key={child.id}>
                          <TOCItem
                            href={`#${child.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate(child.id);
                            }}
                            className="block w-full text-left py-1 text-sm leading-snug cursor-pointer text-foreground/50 hover:text-foreground/70 data-[active=true]:text-foreground/90"
                            style={{
                              fontFamily: "var(--font-content), Georgia, serif",
                            }}
                          >
                            {child.text}
                          </TOCItem>
                          {isChildGroupActive && grandchildren.length > 0 && (
                            <div className="ml-3 border-l border-foreground/6 pl-3 pb-0.5">
                              {grandchildren.map((gc) => (
                                <TOCItem
                                  key={gc.id}
                                  href={`#${gc.id}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    onNavigate(gc.id);
                                  }}
                                  className="block w-full text-left py-0.5 text-[13px] leading-snug cursor-pointer text-foreground/45 hover:text-foreground/65 data-[active=true]:text-foreground/80"
                                  style={{
                                    fontFamily:
                                      "var(--font-content), Georgia, serif",
                                  }}
                                >
                                  {gc.text}
                                </TOCItem>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </ScrollProvider>
  );
}

let highlightStyleInjected = false;
function injectHighlightStyle() {
  if (highlightStyleInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = `::highlight(spec-search) { background-color: #facc15; color: #1a1a1a; }`;
  document.head.appendChild(style);
  highlightStyleInjected = true;
}

function SpecSearch({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const highlightsRef = useRef<Range[]>([]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        setQuery("");
        clearHighlights();
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      injectHighlightStyle();
    }
  }, [open]);

  function clearHighlights() {
    if (typeof CSS !== "undefined" && CSS.highlights) {
      CSS.highlights.delete("spec-search");
    }
  }

  useEffect(() => {
    if (!query || query.length < 2) {
      clearHighlights();
      return;
    }

    const container = containerRef.current;
    if (!container || !CSS.highlights) return;

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const ranges: Range[] = [];
    const lowerQuery = query.toLowerCase();

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.textContent?.toLowerCase() ?? "";
      let idx = text.indexOf(lowerQuery);
      while (idx !== -1) {
        const range = new Range();
        range.setStart(node, idx);
        range.setEnd(node, idx + query.length);
        ranges.push(range);
        idx = text.indexOf(lowerQuery, idx + 1);
      }
    }

    const highlight = new Highlight(...ranges);
    CSS.highlights.set("spec-search", highlight);
    highlightsRef.current = ranges;

    if (ranges.length > 0) {
      const first = ranges[0];
      const rect = first.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      container.scrollTo({
        top: rect.top - containerRect.top + container.scrollTop - 100,
        behavior: "smooth",
      });
    }
  }, [query, containerRef]);

  if (!open) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="flex items-center gap-2 border border-fd-border bg-fd-background shadow-lg px-3 py-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-fd-muted-foreground shrink-0">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search specification..."
          className="flex-1 bg-transparent text-sm text-fd-foreground placeholder:text-fd-muted-foreground/50 outline-none"
        />
        {highlightsRef.current.length > 0 && query.length >= 2 && (
          <span className="text-[11px] text-fd-muted-foreground/60 shrink-0">
            {highlightsRef.current.length} found
          </span>
        )}
        <button
          type="button"
          onClick={() => { setOpen(false); setQuery(""); clearHighlights(); }}
          className="text-fd-muted-foreground hover:text-fd-foreground text-xs"
        >
          ESC
        </button>
      </div>
    </div>
  );
}

export function SpecReader({
  content,
  toc,
  versions,
  currentVersion,
}: {
  content: string;
  toc: TocEntry[];
  versions: string[];
  currentVersion: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tocItems = tocEntriesToItems(toc);

  const scrollToId = useCallback(
    (id: string, behavior: ScrollBehavior = "smooth") => {
      const container = scrollRef.current;
      const el = document.getElementById(id);
      if (!container || !el) return;

      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offset = elRect.top - containerRect.top + container.scrollTop - 24;
      container.scrollTo({ top: offset, behavior });
      window.history.replaceState(null, "", `#${id}`);
    },
    [],
  );

  return (
    <AnchorProvider toc={tocItems}>
      <div className="flex flex-1 min-h-0">
        {/* Reader */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
          <SpecSearch containerRef={scrollRef} />
          <article className="mx-auto max-w-4xl px-5 sm:px-8 py-14 sm:py-20">
            <div className="spec-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 id={slugify(String(children))} className="spec-h1">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 id={slugify(String(children))} className="spec-h2">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 id={slugify(String(children))} className="spec-h3">{children}</h3>
                  ),
                  h4: ({ children }) => (
                    <h4 id={slugify(String(children))} className="spec-h4">{children}</h4>
                  ),
                  code: ({ children, className }) => {
                    if (className?.startsWith("language-")) {
                      const lang = className.replace("language-", "");
                      if (lang === "mermaid") {
                        return <Mermaid chart={String(children).trim()} />;
                      }
                      return (
                        <pre className="spec-code">
                          <code>{String(children).trim()}</code>
                        </pre>
                      );
                    }
                    return <code className="spec-inline-code">{children}</code>;
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
                      target={href?.startsWith("http") ? "_blank" : undefined}
                      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
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
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 py-8 pr-5 pl-6 border-l border-foreground/6">
          <div className="mb-4 pb-4 border-b border-foreground/6">
            <span className="text-[9px] uppercase tracking-[0.15em] text-foreground/40 font-medium block mb-2">
              Version
            </span>
            <VersionSelect
              versions={versions}
              current={currentVersion}
              className="h-8 text-xs font-mono"
            />
          </div>
          <SpecToc toc={toc} onNavigate={scrollToId} />
        </aside>
      </div>
    </AnchorProvider>
  );
}
