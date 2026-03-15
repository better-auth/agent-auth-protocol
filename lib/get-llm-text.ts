import type { InferPageType } from "fumadocs-core/source";
import type { source } from "@/lib/source";
import { getSpecContent, getSpecVersions } from "@/lib/spec";

export async function getLLMText(page: InferPageType<typeof source>) {
	const processed = await page.data.getText("processed");

	return `# ${page.data.title} (${page.url})

${processed}`;
}

export function getAllLLMSpecTexts() {
	return getSpecVersions().map((version) => {
		const { content } = getSpecContent(version);
		return `# Specification ${version} (/specification/${version})

${content}`;
	});
}
