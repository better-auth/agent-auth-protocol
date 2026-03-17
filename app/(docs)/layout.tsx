import type { ReactNode } from "react";
import { DocsTopNav } from "@/components/docs/docs-topnav";
import { getDocsSections } from "@/lib/docs";
import { DocsLayoutShell } from "./layout.client";

export default function Layout({ children }: { children: ReactNode }) {
	const sections = getDocsSections();

	return (
		<DocsLayoutShell sections={sections}>
			<DocsTopNav />
			{children}
		</DocsLayoutShell>
	);
}
