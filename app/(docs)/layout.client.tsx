"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SidebarContent } from "@/components/docs/docs-sidebar";
import { DocsTopNav } from "@/components/docs/docs-topnav";
import type { DocsSection } from "@/lib/docs";

const SIDEBAR_WIDTH = 280;
const NAV_HEIGHT = 45;

export function DocsLayoutShell({
	sections,
	children,
}: {
	sections: DocsSection[];
	children: ReactNode;
}) {
	const pathname = usePathname();
	const showSidebar = pathname.startsWith("/docs");

	return (
		<div className="min-h-dvh">
			<div className="sticky top-0 z-40 bg-fd-card/95 backdrop-blur-sm">
				<DocsTopNav sections={sections} />
			</div>

			<aside
				className="fixed bottom-0 left-0 z-30 hidden lg:flex"
				style={{
					top: NAV_HEIGHT,
					transform: showSidebar
						? "translateX(0)"
						: `translateX(-${SIDEBAR_WIDTH}px)`,
				}}
			>
				<SidebarContent
					sections={sections}
					pathname={pathname}
					showHeader={false}
				/>
			</aside>

			<div
				className="max-lg:ml-0!"
				style={{ marginLeft: showSidebar ? SIDEBAR_WIDTH : 24 }}
			>
				{children}
			</div>
		</div>
	);
}
