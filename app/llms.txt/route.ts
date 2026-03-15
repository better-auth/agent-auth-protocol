import { source } from "@/lib/source";
import { llms } from "fumadocs-core/source";
import { getSpecVersions } from "@/lib/spec";

export const revalidate = false;

export function GET() {
	const docsIndex = llms(source).index();
	const specEntries = getSpecVersions()
		.map((v) => `- [Specification ${v}](/specification/${v})`)
		.join("\n");

	return new Response(`${docsIndex}\n\n## Specification\n\n${specEntries}\n`);
}
