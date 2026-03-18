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

function HashSync() {
  const activeAnchor = useActiveAnchor();
  const lastAnchorRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeAnchor || activeAnchor === lastAnchorRef.current) return;
    lastAnchorRef.current = activeAnchor;
    window.history.replaceState(null, "", `#${activeAnchor}`);
  }, [activeAnchor]);

  return null;
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

type SearchResult = {
  heading: string;
  headingId: string;
  snippet: string;
};

function buildSearchIndex(
  content: string,
  toc: TocEntry[],
): { heading: TocEntry; text: string }[] {
  const sections: { heading: TocEntry; text: string }[] = [];
  const lines = content.split("\n");
  let currentHeading: TocEntry | null = null;
  let currentText: string[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      if (currentHeading) {
        sections.push({ heading: currentHeading, text: currentText.join(" ") });
      }
      const text = match[2].trim();
      const id = slugify(text);
      const level = match[1].length;
      currentHeading = toc.find((t) => t.id === id) ?? { id, text, level };
      currentText = [];
    } else {
      currentText.push(line.replace(/[#*`\[\]()]/g, ""));
    }
  }
  if (currentHeading) {
    sections.push({ heading: currentHeading, text: currentText.join(" ") });
  }
  return sections;
}

function searchSpec(
  index: { heading: TocEntry; text: string }[],
  query: string,
): SearchResult[] {
  if (query.length < 2) return [];
  const lower = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const section of index) {
    const textLower = section.text.toLowerCase();
    const headingLower = section.heading.text.toLowerCase();
    const inHeading = headingLower.includes(lower);
    const idx = textLower.indexOf(lower);

    if (inHeading || idx !== -1) {
      let snippet = "";
      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(section.text.length, idx + query.length + 60);
        snippet =
          (start > 0 ? "..." : "") +
          section.text.slice(start, end).trim() +
          (end < section.text.length ? "..." : "");
      } else {
        snippet =
          section.text.slice(0, 100).trim() +
          (section.text.length > 100 ? "..." : "");
      }
      results.push({
        heading: section.heading.text,
        headingId: section.heading.id,
        snippet,
      });
    }
    if (results.length >= 12) break;
  }
  return results;
}

function SpecSearch({
  content,
  toc,
  onNavigate,
}: {
  content: string;
  toc: TocEntry[];
  onNavigate: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const indexRef = useRef<{ heading: TocEntry; text: string }[]>([]);

  if (indexRef.current.length === 0) {
    indexRef.current = buildSearchIndex(content, toc);
  }

  const results = searchSpec(indexRef.current, query);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        e.stopPropagation();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) {
        close();
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function selectResult(result: SearchResult) {
    onNavigate(result.headingId);
    close();
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIdx]) {
      e.preventDefault();
      selectResult(results[activeIdx]);
    }
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-fd-background/60 backdrop-blur-sm"
        onClick={close}
      />
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
        <div className="w-full max-w-lg pointer-events-auto border border-fd-border bg-fd-background shadow-2xl flex flex-col max-h-[60vh]">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-fd-border">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 text-fd-muted-foreground shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Search specification..."
              className="flex-1 bg-transparent text-sm text-fd-foreground placeholder:text-fd-muted-foreground/50 outline-none"
            />
            <kbd className="text-[10px] font-mono text-fd-muted-foreground/50 border border-fd-border px-1.5 py-0.5">
              ESC
            </kbd>
          </div>

          <div className="overflow-y-auto flex-1">
            {query.length >= 2 && results.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-fd-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}
            {results.map((result, i) => (
              <button
                key={result.headingId + i}
                type="button"
                onClick={() => selectResult(result)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`w-full text-left px-4 py-3 border-b border-fd-border last:border-b-0 transition-colors ${
                  i === activeIdx ? "bg-fd-accent/60" : "hover:bg-fd-accent/30"
                }`}
              >
                <p className="text-sm text-fd-foreground font-medium truncate">
                  {result.heading}
                </p>
                <p className="text-xs text-fd-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                  {result.snippet}
                </p>
              </button>
            ))}
            {query.length < 2 && (
              <div className="px-4 py-8 text-center text-sm text-fd-muted-foreground">
                Type to search the specification...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
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

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const raf = requestAnimationFrame(() => {
      scrollToId(decodeURIComponent(hash), "instant");
    });
    return () => cancelAnimationFrame(raf);
  }, [scrollToId]);

  return (
    <AnchorProvider toc={tocItems}>
      <HashSync />
      <div className="flex flex-1 min-h-0">
        {/* Reader */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
          <SpecSearch content={content} toc={toc} onNavigate={scrollToId} />
          <article className="mx-auto max-w-4xl px-5 sm:px-8 py-14 sm:py-20">
            <div className="spec-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 id={slugify(String(children))} className="spec-h1">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 id={slugify(String(children))} className="spec-h2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 id={slugify(String(children))} className="spec-h3">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 id={slugify(String(children))} className="spec-h4">
                      {children}
                    </h4>
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
        <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 pt-8 pb-16 pr-5 pl-6 border-l border-foreground/6">
          <div className="mb-4 pb-4 border-b border-foreground/6">
            <span className="text-[9px] uppercase tracking-widest text-foreground/40 font-medium block mb-2">
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
