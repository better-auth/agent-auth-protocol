import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";

export interface SpecTocEntry {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const BOX_CHARS = /[┌┐└┘├┤┬┴┼─│╔╗╚╝║═╠╣╦╩╬→←↓↑↔▶◀▼▲►◄]/;
const ASCII_BOX = /\+[-=]{2,}\+/;

function isAsciiDiagram(code: string): boolean {
  const lines = code.split("\n");
  let boxCharLines = 0;
  for (const line of lines) {
    if (BOX_CHARS.test(line) || ASCII_BOX.test(line)) boxCharLines++;
  }
  return boxCharLines >= 3;
}

function buildToc(markdown: string): SpecTocEntry[] {
  const entries: SpecTocEntry[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{2,4})\s+(.+)$/);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].replace(/\*\*/g, "").replace(/`/g, "").trim();
    entries.push({ id: slugify(text), text, level });
  }
  return entries;
}

function buildSectionRefMap(entries: SpecTocEntry[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const entry of entries) {
    const match = entry.text.match(/^(([A-Z]|\d+)(?:\.\d+)*)\b/);
    if (!match) continue;
    map.set(match[1], entry.id);
  }

  return map;
}

function replaceSectionRefs(text: string, refMap: Map<string, string>): string {
  return text.replace(/§(([A-Z]|\d+)(?:\.\d+)*)(\.)?/g, (full, section, _base, trailingDot, offset, source) => {
    const id = refMap.get(section);
    if (!id) return full;

    const prevChar = source[offset - 1];
    if (prevChar === "[") return full;

    const label = `§${section}${trailingDot ?? ""}`;
    return `[${label}](#${id})`;
  });
}

function linkSectionReferences(markdown: string, refMap: Map<string, string>): string {
  const fenceRegex = /```[\s\S]*?```/g;
  let result = "";
  let lastIndex = 0;

  for (const match of markdown.matchAll(fenceRegex)) {
    const index = match.index ?? 0;
    result += linkSectionRefsOutsideInlineCode(markdown.slice(lastIndex, index), refMap);
    result += match[0];
    lastIndex = index + match[0].length;
  }

  result += linkSectionRefsOutsideInlineCode(markdown.slice(lastIndex), refMap);
  return result;
}

function linkSectionRefsOutsideInlineCode(text: string, refMap: Map<string, string>): string {
  return text
    .split(/(`[^`\n]+`)/g)
    .map((part) => (part.startsWith("`") && part.endsWith("`") ? part : replaceSectionRefs(part, refMap)))
    .join("");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function postProcessIetf(html: string): string {
  html = html.replace(
    /(<h1[^>]*class="spec-h1"[^>]*>.*?<\/h1>\s*)((?:<table>[\s\S]*?<\/table>))/,
    '$1<div class="spec-meta">$2</div>'
  );

  html = html.replace(
    /(<h2[^>]*id="abstract"[^>]*>[\s\S]*?<\/h2>)([\s\S]*?)(?=<h2)/,
    '$1<div class="spec-abstract">$2</div>'
  );

  html = html.replace(
    /(<h2[^>]*id="status-of-this-document"[^>]*>[\s\S]*?<\/h2>)([\s\S]*?)(?=<h2)/,
    '$1<div class="spec-status-block">$2</div>'
  );

  html = html.replace(
    /(<h2[^>]*id="13-references"[^>]*>)/,
    '<div class="spec-references">$1'
  );
  html = html.replace(
    /(<h2[^>]*id="14-authors-addresses"[^>]*>)/,
    '</div>$1'
  );

  return html;
}

function renderSpec(rawMd: string): string {
  const marked = new Marked();

  marked.use({
    renderer: {
      heading(token: { text: string; depth: number }) {
        const clean = token.text
          .replace(/<[^>]+>/g, "")
          .replace(/\*\*/g, "")
          .replace(/`/g, "")
          .trim();
        const id = slugify(clean);
        const tag = `h${token.depth}`;
        const cls =
          token.depth === 1
            ? "spec-h1"
            : token.depth === 2
              ? "spec-h2"
              : token.depth === 3
                ? "spec-h3"
                : "spec-h4";
        return `<${tag} id="${id}" class="${cls}"><a href="#${id}" class="spec-heading-link">${token.text}</a></${tag}>\n`;
      },
      code(token: { text: string; lang?: string }) {
        if (!token.lang && isAsciiDiagram(token.text)) {
          return `<div class="spec-diagram"><pre>${escapeHtml(token.text)}</pre></div>\n`;
        }
        const langClass = token.lang ? ` language-${token.lang}` : "";
        return `<div class="spec-code"><pre><code class="hljs${langClass}">${escapeHtml(token.text)}</code></pre></div>\n`;
      },
    },
  });

  return postProcessIetf(marked.parse(rawMd) as string);
}

export function getSpecContent(sourcePath = "src/specs/v1.0-draft.mdx") {
  const filePath = path.join(process.cwd(), sourcePath);
  const raw = fs.readFileSync(filePath, "utf-8");
  const markdown = raw.replace(/^---[\s\S]*?---\s*/, "");
  const toc = buildToc(markdown);
  const linkedMarkdown = linkSectionReferences(markdown, buildSectionRefMap(toc));

  return {
    html: renderSpec(linkedMarkdown),
    toc,
  };
}
