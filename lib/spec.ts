import fs from "node:fs";
import path from "node:path";

export const DEFAULT_SPEC_VERSION = "v1.0-draft";

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function buildToc(markdown: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  let match: RegExpExecArray | null = null;
  while (true) {
    match = headingRegex.exec(markdown);
    if (!match) break;
    const level = match[1].length;
    const text = match[2].trim();
    entries.push({ id: slugify(text), text, level });
  }
  return entries;
}

function buildSectionRefMap(entries: TocEntry[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of entries) {
    const match = entry.text.match(/^(([A-Z]|\d+)(?:\.\d+)*)\b/);
    if (!match) continue;
    map.set(match[1], entry.id);
  }
  return map;
}

function replaceSectionRefs(text: string, refMap: Map<string, string>): string {
  return text.replace(
    /§(([A-Z]|\d+)(?:\.\d+)*)(\.)?/g,
    (full, section, _base, trailingDot, offset, source) => {
      const id = refMap.get(section);
      if (!id) return full;

      const prevChar = source[offset - 1];
      if (prevChar === "[") return full;

      const label = `§${section}${trailingDot ?? ""}`;
      return `[${label}](#${id})`;
    },
  );
}

function linkSectionRefsOutsideInlineCode(
  text: string,
  refMap: Map<string, string>,
): string {
  return text
    .split(/(`[^`\n]+`)/g)
    .map((part) =>
      part.startsWith("`") && part.endsWith("`")
        ? part
        : replaceSectionRefs(part, refMap),
    )
    .join("");
}

function linkSectionReferences(
  markdown: string,
  refMap: Map<string, string>,
): string {
  const fenceRegex = /```[\s\S]*?```/g;
  let result = "";
  let lastIndex = 0;

  for (const match of markdown.matchAll(fenceRegex)) {
    const index = match.index ?? 0;
    result += linkSectionRefsOutsideInlineCode(
      markdown.slice(lastIndex, index),
      refMap,
    );
    result += match[0];
    lastIndex = index + match[0].length;
  }

  result += linkSectionRefsOutsideInlineCode(markdown.slice(lastIndex), refMap);
  return result;
}

export function getSpecVersions() {
  const dir = path.join(process.cwd(), "content", "specification");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getSpecContent(version = DEFAULT_SPEC_VERSION) {
  const filePath = path.join(
    process.cwd(),
    "content",
    "specification",
    `${version}.mdx`,
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  const markdown = raw.replace(/^---[\s\S]*?---\n*/, "");
  const toc = buildToc(markdown);
  const content = linkSectionReferences(markdown, buildSectionRefMap(toc));

  return { content, toc };
}
