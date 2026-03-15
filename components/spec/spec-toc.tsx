"use client";

import { TOCItem, useActiveAnchor, type TOCItemType } from "fumadocs-core/toc";
import { cn } from "@/lib/utils";

/**
 * Group TOC items by their parent h2.
 * Returns [h2, [h3 children]] pairs, preserving order.
 */
function groupByH2(toc: TOCItemType[]) {
  const groups: { parent: TOCItemType; children: TOCItemType[] }[] = [];
  for (const item of toc) {
    if (item.depth === 2) {
      groups.push({ parent: item, children: [] });
    } else if (item.depth >= 3 && groups.length > 0) {
      groups[groups.length - 1].children.push(item);
    }
  }
  return groups;
}

export function SpecTocItems({ toc }: { toc: TOCItemType[] }) {
  const activeAnchor = useActiveAnchor();
  const groups = groupByH2(toc);

  // Find which h2 group is active
  const activeGroupIdx = groups.findIndex((g) => {
    const parentId = g.parent.url.slice(1);
    if (activeAnchor === parentId) return true;
    return g.children.some((c) => c.url.slice(1) === activeAnchor);
  });

  return (
    <nav aria-label="Table of Contents" className="flex flex-col">
      {groups.map((group, idx) => {
        const parentId = group.parent.url.slice(1);
        const isGroupActive = idx === activeGroupIdx;
        const isParentActive = activeAnchor === parentId;

        return (
          <div key={parentId} className="mb-0.5">
            <TOCItem
              href={group.parent.url}
              className={cn(
                "block w-full text-left py-1.5 text-[13px] leading-snug transition-colors break-words",
                "data-[active=true]:text-fd-primary data-[active=true]:font-medium",
                !isGroupActive &&
                  "text-fd-muted-foreground hover:text-fd-accent-foreground",
                isGroupActive &&
                  !isParentActive &&
                  "text-fd-foreground/70",
              )}
            >
              {group.parent.title}
            </TOCItem>
            {isGroupActive && group.children.length > 0 && (
              <div className="ml-3 border-l border-fd-border pl-3 pb-1">
                {group.children.map((child) => (
                  <TOCItem
                    key={child.url}
                    href={child.url}
                    className={cn(
                      "block w-full text-left text-[12px] leading-snug transition-colors",
                      "text-fd-muted-foreground/80 hover:text-fd-accent-foreground",
                      "data-[active=true]:text-fd-primary",
                      child.depth === 3 && "py-1",
                      child.depth >= 4 &&
                        "py-0.5 ml-3 pl-3 border-l border-fd-border",
                    )}
                  >
                    {child.title}
                  </TOCItem>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
