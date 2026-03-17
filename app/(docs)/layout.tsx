import type { ReactNode } from "react";
import { getDocsSections } from "@/lib/docs";
import { DocsLayoutShell } from "./layout.client";

export default function Layout({ children }: { children: ReactNode }) {
	const sections = getDocsSections();

	return (
		<DocsLayoutShell sections={sections}>
			{children}
		</DocsLayoutShell>
	);
}
