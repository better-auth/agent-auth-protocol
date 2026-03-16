import Link from "next/link";
import { notFound } from "next/navigation";
import { getSpecContent, getSpecVersions } from "@/lib/spec";
import { SpecReader } from "@/components/spec/spec-reader";
import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export function generateStaticParams() {
	return getSpecVersions().map((version) => ({ version }));
}

export function generateMetadata(props: {
	params: Promise<{ version: string }>;
}) {
	return props.params.then((params) => ({
		title: `Specification ${params.version} — Agent Auth Protocol`,
		description: `Agent Auth Protocol ${params.version} specification.`,
	}));
}

export default async function SpecVersionPage(props: {
	params: Promise<{ version: string }>;
}) {
	const { version } = await props.params;
	const versions = getSpecVersions();

	if (!versions.includes(version)) notFound();

	const { content, toc } = getSpecContent(version);

	return (
		<div className="fixed inset-0 flex flex-col">
			<header className="flex items-center justify-between px-4 border-b border-foreground/8 shrink-0 py-1 bg-background/80 backdrop-blur-sm">
				<Link href="/" className="flex items-center gap-1">
					<Logo className="h-4 w-4" />
					<span className="select-none text-sm uppercase">
						BETTER-AUTH.
					</span>
				</Link>
				<ThemeToggle />
			</header>
			<SpecReader
				content={content}
				toc={toc}
				versions={versions}
				currentVersion={version}
			/>
		</div>
	);
}
