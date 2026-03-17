"use client";

import { TOCItem, useActiveAnchor, type TOCItemType } from "fumadocs-core/toc";
import { cn } from "@/lib/utils";

export function DocsToc({ toc }: { toc: TOCItemType[] }) {
  const activeAnchor = useActiveAnchor();

  if (toc.length === 0) return null;

  return (
    <nav aria-label="Table of Contents" className="flex flex-col gap-0.5">
      <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-fd-muted-foreground/70">
        On this page
      </p>
      {toc.map((item) => {
        const id = item.url.slice(1);
        const isActive = activeAnchor === id;

        return (
          <TOCItem
            key={item.url}
            href={item.url}
            className={cn(
              "block text-[13px] leading-relaxed py-0.5 transition-colors",
              item.depth >= 3 && "pl-3",
              item.depth >= 4 && "pl-6",
              isActive
                ? "text-fd-primary font-medium"
                : "text-fd-muted-foreground hover:text-fd-foreground",
            )}
          >
            {item.title}
          </TOCItem>
        );
      })}
    </nav>
  );
}
