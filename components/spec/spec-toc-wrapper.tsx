"use client";

import { useRef } from "react";
import {
  AnchorProvider,
  ScrollProvider,
  type TOCItemType,
} from "fumadocs-core/toc";
import { SpecTocItems } from "./spec-toc";

export function SpecTocWrapper({ toc }: { toc: TOCItemType[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <AnchorProvider toc={toc}>
      <div
        id="nd-toc"
        className="sticky top-(--fd-docs-row-3) [grid-area:toc] h-[calc(var(--fd-docs-height)-var(--fd-docs-row-3))] flex flex-col w-(--fd-toc-width) pt-12 pe-4 pb-2 xl:layout:[--fd-toc-width:268px] max-xl:hidden"
      >
        <h3 className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground mb-2">
          Contents
        </h3>
        <ScrollProvider containerRef={scrollRef}>
          <div
            ref={scrollRef}
            className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:none] py-3"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent, white 16px, white calc(100% - 16px), transparent)",
            }}
          >
            <SpecTocItems toc={toc} />
          </div>
        </ScrollProvider>
      </div>
    </AnchorProvider>
  );
}
