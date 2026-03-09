import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";

export interface SpecTocEntry {
  id: string;
  text: string;
  level: number;
}

export interface SpecSection {
  slug: string;
  number: string;
  title: string;
  html: string;
  toc: SpecTocEntry[];
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

  return marked.parse(rawMd) as string;
}

function readSpec(sourcePath = "spec.mdx"): string {
  const filePath = path.join(process.cwd(), sourcePath);
  const raw = fs.readFileSync(filePath, "utf-8");
  return raw.replace(/^---[\s\S]*?---\s*/, "");
}

// --- Full spec (original behavior) ---

export function getSpecContent(sourcePath = "spec.mdx") {
  const markdown = readSpec(sourcePath);
  const toc = buildToc(markdown);
  const linkedMarkdown = linkSectionReferences(markdown, buildSectionRefMap(toc));

  return {
    html: renderSpec(linkedMarkdown),
    toc,
  };
}

// --- Section-based spec ---

const SECTION_SLUGS: Record<string, string> = {
  "1": "introduction",
  "2": "agent",
  "3": "host",
  "4": "capabilities",
  "5": "authentication",
  "6": "server",
  "7": "client",
  "8": "data-model",
  "9": "approval-methods",
  "10": "security",
  "11": "related-specs",
  "12": "observability",
  "13": "implementation",
  "14": "privacy",
  "15": "references",
  "16": "non-goals",
  "A": "appendix",
};

function sectionSlug(title: string): string {
  const num = title.match(/^(\d+)[\.\:]/)?.[1];
  if (num && SECTION_SLUGS[num]) return SECTION_SLUGS[num];
  if (/^Appendix\s+[A-Z]/i.test(title)) return "appendix";
  return slugify(title);
}

function splitMarkdownSections(markdown: string): { preamble: string; sections: { title: string; body: string }[] } {
  const lines = markdown.split("\n");
  let preamble = "";
  const sections: { title: string; body: string }[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];
  let foundFirstH2 = false;

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      if (foundFirstH2) {
        sections.push({ title: currentTitle, body: currentLines.join("\n") });
      } else {
        preamble = currentLines.join("\n");
        foundFirstH2 = true;
      }
      currentTitle = h2Match[1].replace(/\*\*/g, "").replace(/`/g, "").trim();
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  if (foundFirstH2) {
    sections.push({ title: currentTitle, body: currentLines.join("\n") });
  }

  return { preamble, sections };
}

let cachedSections: SpecSection[] | null = null;

export function getSpecSections(sourcePath = "spec.mdx"): SpecSection[] {
  if (cachedSections) return cachedSections;

  const markdown = readSpec(sourcePath);
  const fullToc = buildToc(markdown);
  const refMap = buildSectionRefMap(fullToc);

  const { preamble, sections: rawSections } = splitMarkdownSections(markdown);

  cachedSections = rawSections.map((sec, i) => {
    const slug = sectionSlug(sec.title);
    const numMatch = sec.title.match(/^(\d+)\.\s/);
    const isAppendix = /^Appendix\s+[A-Z]/i.test(sec.title);
    const num = numMatch ? numMatch[1] : (isAppendix ? "A" : "");
    const shortTitle = sec.title.replace(/^\d+\.\s*/, "").replace(/^Appendix\s+[A-Z]:\s*/i, "");

    let sectionMd = sec.body;
    if (i === 0 && preamble.trim()) {
      sectionMd = preamble + "\n\n" + sectionMd;
    }

    const linkedMd = linkSectionReferences(sectionMd, refMap);
    const html = renderSpec(linkedMd);
    const toc = buildToc(sectionMd);

    return {
      slug,
      number: num,
      title: shortTitle,
      html,
      toc,
    };
  });

  return cachedSections;
}

export function getSpecSectionBySlug(slug: string, sourcePath = "spec.mdx"): SpecSection | undefined {
  return getSpecSections(sourcePath).find((s) => s.slug === slug);
}

export function getSectionSlugs(sourcePath = "spec.mdx"): string[] {
  return getSpecSections(sourcePath).map((s) => s.slug);
}

export function buildHashToSectionMap(sourcePath = "spec.mdx"): Map<string, string> {
  const map = new Map<string, string>();
  for (const section of getSpecSections(sourcePath)) {
    for (const entry of section.toc) {
      map.set(entry.id, section.slug);
    }
  }
  return map;
}
