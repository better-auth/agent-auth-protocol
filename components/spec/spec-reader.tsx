"use client";

import { use, useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createHighlighter } from "shiki";
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

const highlighterPromise = createHighlighter({
  themes: ["one-light", "one-dark-pro"],
  langs: ["json", "typescript", "javascript", "bash", "http", "text"],
});

function CodeBlock({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const lang = className?.replace("language-", "") || "text";

  if (lang === "mermaid") {
    return <Mermaid chart={children.trim()} />;
  }

  const highlighter = use(highlighterPromise);
  const loaded = highlighter.getLoadedLanguages();
  const safeLang = loaded.includes(lang) ? lang : "text";
  const html = highlighter.codeToHtml(children.trim(), {
    lang: safeLang,
    themes: { light: "one-light", dark: "one-dark-pro" },
  });
  return (
    <div
      className="spec-code [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0"
      // biome-ignore lint: shiki output is sanitized
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
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
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
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
