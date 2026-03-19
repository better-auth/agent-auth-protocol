"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { DocsSection } from "@/lib/docs";
import { GitHubIcon, WordmarkLogo } from "@/components/icons";

const SIDEBAR_WIDTH = 280;

function phi(d: string) {
  return function PhIcon({ className }: { className?: string }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        fill="currentColor"
        className={className}
      >
        <path d={d} />
      </svg>
    );
  };
}

const ITEM_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "file-text": phi(
    "M232 48h-64a32 32 0 0 0-32 32v87.73a8.17 8.17 0 0 1-7.47 8.25a8 8 0 0 1-8.53-8V80a32 32 0 0 0-32-32H24a8 8 0 0 0-8 8v144a8 8 0 0 0 8 8h72a24 24 0 0 1 24 23.94a7.9 7.9 0 0 0 5.12 7.55A8 8 0 0 0 136 232a24 24 0 0 1 24-24h72a8 8 0 0 0 8-8V56a8 8 0 0 0-8-8m-24 120h-39.73a8.17 8.17 0 0 1-8.25-7.47a8 8 0 0 1 8-8.53h39.73a8.17 8.17 0 0 1 8.25 7.47a8 8 0 0 1-8 8.53m0-32h-39.73a8.17 8.17 0 0 1-8.25-7.47a8 8 0 0 1 8-8.53h39.73a8.17 8.17 0 0 1 8.25 7.47a8 8 0 0 1-8 8.53m0-32h-39.73a8.17 8.17 0 0 1-8.27-7.47a8 8 0 0 1 8-8.53h39.73a8.17 8.17 0 0 1 8.27 7.47a8 8 0 0 1-8 8.53",
  ),
  server: phi(
    "M208 40H48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-28 52a12 12 0 1 1 12-12a12 12 0 0 1-12 12m28 44H48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-48a16 16 0 0 0-16-16m-28 52a12 12 0 1 1 12-12a12 12 0 0 1-12 12",
  ),
  cable: ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="currentColor"
        d="M9.9 2H8.1A2.6 2.6 0 0 0 8 3v18c-.032.337.002.676.1 1h1.8c.098-.324.132-.663.1-1V3a2.6 2.6 0 0 0-.1-1"
        opacity=".25"
      />
      <path fill="currentColor" d="M3 2h5v20H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1" />
      <path
        fill="currentColor"
        d="M10 2h11a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H10z"
        opacity=".5"
      />
    </svg>
  ),
  bot: ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M13.5 2c0 .444-.193.843-.5 1.118V5h5a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h5V3.118A1.5 1.5 0 1 1 13.5 2M0 10h2v6H0zm24 0h-2v6h2zM9 14.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m7.5-1.5a1.5 1.5 0 1 0-3 0a1.5 1.5 0 0 0 3 0" />
    </svg>
  ),
  monitor: phi(
    "M208 40H48a24 24 0 0 0-24 24v112a24 24 0 0 0 24 24h72v16H96a8 8 0 0 0 0 16h64a8 8 0 0 0 0-16h-24v-16h72a24 24 0 0 0 24-24V64a24 24 0 0 0-24-24m0 144H48a8 8 0 0 1-8-8v-16h176v16a8 8 0 0 1-8 8",
  ),
  key: phi(
    "M216.57 39.43a80 80 0 0 0-132.66 81.35L28.69 176A15.86 15.86 0 0 0 24 187.31V216a16 16 0 0 0 16 16h32a8 8 0 0 0 8-8v-16h16a8 8 0 0 0 8-8v-16h16a8 8 0 0 0 5.66-2.34l9.56-9.57A79.7 79.7 0 0 0 160 176h.1a80 80 0 0 0 56.47-136.57M180 92a16 16 0 1 1 16-16a16 16 0 0 1-16 16",
  ),
  compass: phi(
    "M128 24a104 104 0 1 0 104 104A104.12 104.12 0 0 0 128 24m87.62 96h-39.83c-1.79-36.51-15.85-62.33-27.38-77.6a88.19 88.19 0 0 1 67.22 77.6ZM96.23 136h63.54c-2.31 41.61-22.23 67.11-31.77 77c-9.55-9.9-29.46-35.4-31.77-77m0-16c2.31-41.61 22.23-67.11 31.77-77c9.55 9.93 29.46 35.43 31.77 77Zm52.18 93.6c11.53-15.27 25.56-41.09 27.38-77.6h39.84a88.19 88.19 0 0 1-67.22 77.6",
  ),
  wrench: phi(
    "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-91 94.25l-40 32a8 8 0 1 1-10-12.5L107.19 128L75 102.25a8 8 0 1 1 10-12.5l40 32a8 8 0 0 1 0 12.5M176 168h-40a8 8 0 0 1 0-16h40a8 8 0 0 1 0 16",
  ),
  plug: phi(
    "M165.78 224H208a16 16 0 0 0 16-16v-37.65a8 8 0 0 0-11.06-7.35a23.4 23.4 0 0 1-8.94 1.77c-13.23 0-24-11.1-24-24.73s10.77-24.73 24-24.73a23.4 23.4 0 0 1 8.94 1.77a8 8 0 0 0 11.06-7.43V72a16 16 0 0 0-16-16h-36.22a35 35 0 0 0 .22-4a36 36 0 0 0-72 0a35 35 0 0 0 .22 4H64a16 16 0 0 0-16 16v32.22a35 35 0 0 0-4-.22a36 36 0 0 0 0 72a35 35 0 0 0 4-.22V208a16 16 0 0 0 16 16h42.22",
  ),
  package: phi(
    "m223.68 66.15l-88-48.15a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03M128 120L47.65 76L128 32l80.35 44Zm8 99.64v-85.81l80-43.78v85.76Z",
  ),
  shield: phi(
    "M208 40H48a16 16 0 0 0-16 16v56c0 52.72 25.52 84.67 46.93 102.19c23.06 18.86 46 25.26 47 25.53a8 8 0 0 0 4.2 0c1-.27 23.91-6.67 47-25.53C198.48 196.67 224 164.72 224 112V56a16 16 0 0 0-16-16m-34.32 69.66l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32Z",
  ),
  lock: phi(
    "M208 80h-32V64a48 48 0 0 0-96 0v16H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16m-72 78.63V176a8 8 0 0 1-16 0v-17.37a24 24 0 1 1 16 0M160 80H96V64a32 32 0 0 1 64 0Z",
  ),
  "check-circle": phi(
    "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m45.66 85.66l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32",
  ),
  "alert-triangle": phi(
    "M236.8 188.09L149.35 36.22a24.76 24.76 0 0 0-42.7 0L19.2 188.09a23.51 23.51 0 0 0 0 23.72A24.35 24.35 0 0 0 40.55 224h174.9a24.35 24.35 0 0 0 21.33-12.19a23.51 23.51 0 0 0 .02-23.72M120 104a8 8 0 0 1 16 0v40a8 8 0 0 1-16 0Zm8 88a12 12 0 1 1 12-12a12 12 0 0 1-12 12",
  ),
  database: phi(
    "M128 24c-53.83 0-96 24.6-96 56v96c0 31.4 42.17 56 96 56s96-24.6 96-56V80c0-31.4-42.17-56-96-56m80 152c0 18.28-35.89 40-80 40s-80-21.72-80-40v-20.55C68.4 170.7 95.7 180 128 180s59.6-9.3 80-24.55Zm0-52c0 18.28-35.89 40-80 40s-80-21.72-80-40v-20.55C68.4 118.7 95.7 128 128 128s59.6-9.3 80-24.55ZM128 112c-44.11 0-80-21.72-80-32s35.89-40 80-40s80 21.72 80 40s-35.89 32-80 32",
  ),
  "eye-off": phi(
    "M53.92 34.62a8 8 0 1 0-11.84 10.76l19.24 21.17C25.3 92.67 4.38 120.17 3.52 121.32a16.07 16.07 0 0 0 0 13.36C7.2 141.13 40.81 200 128 200a131.6 131.6 0 0 0 51.51-10.37l22.56 24.75a8 8 0 1 0 11.84-10.76ZM128 164a36 36 0 0 1-29.54-56.85l49.11 54a35.9 35.9 0 0 1-19.57 2.85m124.48-42.68a16.07 16.07 0 0 0 0-13.32c-3.68-6.45-37.29-65-124.48-65a132 132 0 0 0-42.08 6.88l14.33 15.72A117.9 117.9 0 0 1 128 60c64.22 0 93.05 42.89 97.83 51.36c-2 3.49-8.86 14.47-21.14 26.07l12 13.17a166 166 0 0 0 35.79-28.58",
  ),
  code: phi(
    "M69.12 94.15L28.5 128l40.62 33.85a8 8 0 1 1-10.24 12.29l-48-40a8 8 0 0 1 0-12.29l48-40a8 8 0 0 1 10.24 12.3m176 27.7l-48-40a8 8 0 1 0-10.24 12.3L227.5 128l-40.62 33.85a8 8 0 1 0 10.24 12.29l48-40a8 8 0 0 0 0-12.29m-82.39-89.37a8 8 0 0 0-10.25 4.79l-64 176a8 8 0 0 0 4.79 10.26A8.14 8.14 0 0 0 96 224a8 8 0 0 0 7.52-5.27l64-176a8 8 0 0 0-4.79-10.25",
  ),
  cpu: phi(
    "M152 96h-48a8 8 0 0 0-8 8v48a8 8 0 0 0 8 8h48a8 8 0 0 0 8-8v-48a8 8 0 0 0-8-8m-8 48h-32v-32h32Zm88-16h-16v-16h16a8 8 0 0 0 0-16h-16V80a16 16 0 0 0-16-16h-16V48a8 8 0 0 0-16 0v16h-16V48a8 8 0 0 0-16 0v16h-16V48a8 8 0 0 0-16 0v16H80a16 16 0 0 0-16 16v16H48a8 8 0 0 0 0 16h16v16H48a8 8 0 0 0 0 16h16v16H48a8 8 0 0 0 0 16h16v16a16 16 0 0 0 16 16h16v16a8 8 0 0 0 16 0v-16h16v16a8 8 0 0 0 16 0v-16h16v16a8 8 0 0 0 16 0v-16h16a16 16 0 0 0 16-16v-16h16a8 8 0 0 0 0-16h-16v-16h16a8 8 0 0 0 0-16m-32 48H80V80h120Z",
  ),
  terminal: phi(
    "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-91 94.25l-40 32a8 8 0 1 1-10-12.5L107.19 128L75 102.25a8 8 0 1 1 10-12.5l40 32a8 8 0 0 1 0 12.5M176 168h-40a8 8 0 0 1 0-16h40a8 8 0 0 1 0 16",
  ),
};

function SearchTrigger({ onSearch }: { onSearch?: () => void }) {
  const isMac = useMemo(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.platform?.toLowerCase().includes("mac") ?? true;
  }, []);

  const openSearch = useCallback(() => {
    onSearch?.();
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true,
    });
    document.dispatchEvent(event);
  }, [isMac, onSearch]);

  return (
    <button
      type="button"
      onClick={openSearch}
      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-fd-muted-foreground border-b border-fd-border hover:bg-fd-accent/50 transition-colors"
    >
      <Search className="size-3.5 shrink-0" />
      <span className="flex-1 text-left">Search</span>
      <kbd className="text-[10px] font-mono text-fd-muted-foreground/60 border border-fd-border px-1.5 h-[22px] inline-flex items-center justify-center gap-1">
        {isMac ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
        ) : (
          <span>Ctrl</span>
        )}
        <span>K</span>
      </kbd>
    </button>
  );
}

export function DocsSidebar({ sections }: { sections: DocsSection[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = sections
    .flatMap((s) => s.items)
    .find((item) => pathname === item.href);

  return (
    <>
      {/* Mobile top bar */}
      <DocsMobileTopBar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        currentPage={currentPage}
      />

      {/* Mobile overlay - rendered via portal to avoid sticky clipping */}
      <MobileSidebarOverlay
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        sections={sections}
        pathname={pathname}
      />
    </>
  );
}

function DocsMobileTopBar({
  mobileOpen,
  setMobileOpen,
  currentPage,
}: {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean | ((v: boolean) => boolean)) => void;
  currentPage?: { title: string };
}) {
  return (
    <div className="border-b border-fd-border lg:hidden">
      <div className="flex items-center gap-3 px-4 h-11">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex size-7 items-center justify-center border border-fd-border text-fd-foreground/70 hover:bg-fd-accent transition-colors"
        >
          {mobileOpen ? (
            <X className="size-3.5" />
          ) : (
            <Menu className="size-3.5" />
          )}
        </button>
        <Link href="/" className="select-none">
          <WordmarkLogo className="h-4 w-auto" />
        </Link>
        {currentPage && (
          <>
            <ChevronRight className="size-3 text-fd-muted-foreground/50 shrink-0" />
            <span className="text-sm text-fd-foreground truncate">
              {currentPage.title}
            </span>
          </>
        )}
        <div className="ml-auto flex items-center gap-1">
          <a
            href="https://github.com/better-auth/agent-auth-protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md text-foreground/90 hover:text-foreground transition-colors"
          >
            <GitHubIcon className="size-4" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

function MobileSidebarOverlay({
  mobileOpen,
  setMobileOpen,
  sections,
  pathname,
}: {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  sections: DocsSection[];
  pathname: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-fd-background/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <motion.div
            initial={{ x: -SIDEBAR_WIDTH }}
            animate={{ x: 0 }}
            exit={{ x: -SIDEBAR_WIDTH }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden"
          >
            <SidebarContent
              sections={sections}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function SidebarContent({
	sections,
	pathname,
	onNavigate,
	showHeader = true,
	headerSlot,
}: {
	sections: DocsSection[];
	pathname: string;
	onNavigate?: () => void;
	showHeader?: boolean;
	headerSlot?: React.ReactNode;
}) {
	return (
		<div
			className="flex h-full flex-col border-r border-fd-border bg-fd-card"
			style={{ width: SIDEBAR_WIDTH }}
		>
			{headerSlot ? headerSlot : showHeader ? (
				<div className="shrink-0 px-4 h-11 flex items-center border-b border-fd-border">
					<Link
						href="/"
						className="inline-block select-none"
						onClick={onNavigate}
					>
						<WordmarkLogo className="h-4 w-auto" />
					</Link>
				</div>
			) : null}
			<SearchTrigger onSearch={onNavigate} />

      {/* Sections */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <nav>
          {sections.map((section) => (
            <div key={section.title} className="py-3">
              <p className="px-4 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-fd-muted-foreground/70">
                {section.title}
              </p>
              <ul>
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  const ItemIcon = ITEM_ICONS[item.icon];
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-1.5 text-[13px] transition-colors duration-150",
                          active
                            ? "bg-fd-primary/8 text-fd-foreground"
                            : "text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent/50",
                        )}
                      >
                        {ItemIcon && (
                          <ItemIcon className="size-3.5 shrink-0 opacity-50" />
                        )}
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

    </div>
  );
}
