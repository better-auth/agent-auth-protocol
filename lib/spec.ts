import fs from "node:fs";
import path from "node:path";

export interface TocEntry {
	id: string;
	text: string;
	level: number;
}

export function getSpecContent() {
	const filePath = path.join(process.cwd(), "spec", "v1.0-draft.mdx");
	const raw = fs.readFileSync(filePath, "utf-8");

	const withoutFrontmatter = raw.replace(/^---[\s\S]*?---\n*/, "");

	const toc: TocEntry[] = [];
	const headingRegex = /^(#{2,4})\s+(.+)$/gm;
	let match: RegExpExecArray | null = null;
	while (true) {
		match = headingRegex.exec(withoutFrontmatter);
		if (!match) break;
		const level = match[1].length;
		const text = match[2].trim();
		const id = text
			.toLowerCase()
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-");
		toc.push({ id, text, level });
	}

	return { content: withoutFrontmatter, toc };
}
