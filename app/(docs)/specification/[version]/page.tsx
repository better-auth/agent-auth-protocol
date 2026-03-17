import { notFound } from "next/navigation";
import { getSpecContent, getSpecVersions } from "@/lib/spec";
import { SpecReader } from "@/components/spec/spec-reader";

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
		<div className="h-[calc(100dvh-45px)] flex flex-col">
			<SpecReader
				content={content}
				toc={toc}
				versions={versions}
				currentVersion={version}
			/>
		</div>
	);
}
