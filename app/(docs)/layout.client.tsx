"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DocsSidebar, SidebarContent } from "@/components/docs/docs-sidebar";
import { DocsTopNav } from "@/components/docs/docs-topnav";
import type { DocsSection } from "@/lib/docs";

const SIDEBAR_WIDTH = 280;

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
			<aside
				className="fixed inset-y-0 left-0 z-30 hidden lg:flex"
				style={{
					transform: showSidebar
						? "translateX(0)"
						: `translateX(-${SIDEBAR_WIDTH}px)`,
				}}
			>
				<SidebarContent sections={sections} pathname={pathname} />
			</aside>

			<div
				className="max-lg:ml-0!"
				style={{ marginLeft: showSidebar ? SIDEBAR_WIDTH : 0 }}
			>
				<div className="sticky top-0 z-30 bg-fd-card/95 backdrop-blur-sm">
					<div className={showSidebar ? "lg:hidden" : "hidden"}>
						<DocsSidebar sections={sections} />
					</div>
					<DocsTopNav />
				</div>
				{children}
			</div>
		</div>
	);
}
