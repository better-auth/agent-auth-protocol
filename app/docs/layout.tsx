import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { source } from "@/lib/source";
import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<DocsLayout
			tree={source.getPageTree()}
			nav={{
				url: "/",
				title: (
					<span className="!font-normal flex items-center gap-1">
						<Logo className="h-4 w-4" />
						<span className="select-none font-mono text-sm uppercase">BETTER-AUTH.</span>
					</span>
				),
			}}
			themeSwitch={{
				component: <ThemeToggle />,
			}}
		>
			{children}
		</DocsLayout>
	);
}
