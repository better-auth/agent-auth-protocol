import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
	convertToModelMessages,
	stepCountIs,
	streamText,
	wrapLanguageModel,
	type UIMessage,
} from "ai";
import type { LanguageModelMiddleware } from "ai";
import { z } from "zod/v4";
import { source } from "@/lib/source";
import { initAdvancedSearch } from "fumadocs-core/search/server";
import type { StructuredData } from "fumadocs-core/mdx-plugins";
import {
	DEFAULT_SPEC_VERSION,
	getSpecContent,
	getSpecVersions,
} from "@/lib/spec";

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

// Build unified Orama search index: docs + spec sections
const searchServer = initAdvancedSearch({
	indexes: async () => {
		// Index docs pages
		const docsIndexes = await Promise.all(
			source.getPages().map(async (page) => {
				const data = page.data as unknown as Record<string, unknown>;
				let structuredData: StructuredData | undefined;

				if ("structuredData" in data) {
					structuredData =
						typeof data.structuredData === "function"
							? await (data.structuredData as () => Promise<StructuredData>)()
							: (data.structuredData as StructuredData);
				}

				return {
					id: page.url,
					title: page.data.title,
					description: page.data.description,
					structuredData: structuredData ?? {
						headings: [],
						contents: [],
					},
					url: page.url,
				};
			}),
		);

		// Index spec sections
		const specIndexes = buildSpecIndexes();

		return [...docsIndexes, ...specIndexes];
	},
});

function buildSpecIndexes() {
	const { content, toc } = getSpecContent();
	const lines = content.split("\n");
	const headingRegex = /^(#{2,4})\s+(.+)$/;
	const sections: Array<{
		id: string;
		title: string;
		content: string;
	}> = [];

	let current: { id: string; title: string; lines: string[] } | null = null;

	for (const line of lines) {
		const match = line.match(headingRegex);
		if (match) {
			if (current) {
				sections.push({
					id: current.id,
					title: current.title,
					content: current.lines.join("\n").trim(),
				});
			}
			const text = match[2].trim();
			const tocEntry = toc.find((t) => t.text === text);
			current = {
				id: tocEntry?.id ?? text.toLowerCase().replace(/\s+/g, "-"),
				title: text,
				lines: [],
			};
		} else if (current) {
			current.lines.push(line);
		}
	}
	if (current) {
		sections.push({
			id: current.id,
			title: current.title,
			content: current.lines.join("\n").trim(),
		});
	}

	return sections.map((section) => ({
		id: `/specification/${DEFAULT_SPEC_VERSION}#${section.id}`,
		title: `Spec: ${section.title}`,
		description: `Agent Auth Protocol Specification — ${section.title}`,
		structuredData: {
			headings: [{ id: section.id, content: section.title }],
			contents: [{ heading: section.id, content: section.content }],
		},
		url: `/specification/${DEFAULT_SPEC_VERSION}#${section.id}`,
	}));
}

// Generate llms.txt-style page listing for system prompt
function getPageListing(): string {
	const pages = source.getPages();
	const versions = getSpecVersions();

	const lines = [
		"# Documentation Pages\n",
		...pages.map((p) => {
			const desc = p.data.description ? `: ${p.data.description}` : "";
			return `- [${p.data.title}](${p.url})${desc}`;
		}),
		"\n# Specification\n",
		...versions.map((v) => `- [Specification ${v}](/specification/${v})`),
	];

	return lines.join("\n");
}

const systemPrompt = `You are a documentation assistant for the Agent Auth Protocol.
You ONLY answer questions related to Agent Auth Protocol, its documentation, and its specification.

STRICT RULES:
- NEVER answer questions unrelated to Agent Auth Protocol (e.g. general coding, math, politics, religion, or any other off-topic subject).
- If a question is out of scope, respond: "I can only answer questions about Agent Auth Protocol. What would you like to know?"
- ONLY use information retrieved from the documentation via tool calls. Do not use prior knowledge.
- If you cannot find the answer in the docs, say "I couldn't find this in the documentation" rather than guessing.

TOOLS:
1. \`searchDocs\` — Search documentation and specification.
2. \`getPageContent\` — Fetch a page's full content.

WORKFLOW:
1. Use \`searchDocs\` to find relevant pages.
2. Use \`getPageContent\` to read pages you need.
3. Answer based ONLY on retrieved content. Cite sources with markdown links.

Respond in the same language as the user's question.

${getPageListing()}`;

export async function POST(req: Request) {
	const { messages }: { messages?: UIMessage[] } = await req.json();

	const middlewares: LanguageModelMiddleware[] = [];

	if (process.env.NODE_ENV === "development") {
		const { devToolsMiddleware } = await import("@ai-sdk/devtools");
		middlewares.push(devToolsMiddleware());
	}

	const model = wrapLanguageModel({
		model: openrouter.chat(
			process.env.OPENROUTER_MODEL ?? "moonshotai/kimi-k2.5",
		),
		middleware: middlewares,
	});

	const result = streamText({
		model,
		stopWhen: stepCountIs(10),
		tools: {
			searchDocs: {
				description:
					"Search the Agent Auth Protocol documentation and specification. Returns matching pages with URLs.",
				inputSchema: z.object({
					query: z.string().describe("Search query"),
				}),
				execute: async ({ query }) => {
					const results = await searchServer.search(query, {
						limit: 10,
					});

					if (results.length === 0) {
						return `No results found for "${query}".`;
					}

					const seen = new Set<string>();
					const deduped = results.filter((r) => {
						if (!r.url || seen.has(r.url)) return false;
						seen.add(r.url);
						return true;
					});

					return deduped
						.slice(0, 10)
						.map((r, i) => `${i + 1}. ${r.content} (${r.url})`)
						.join("\n");
				},
			},
			getPageContent: {
				description:
					"Get the full content of a documentation page. Use the page slug like 'introduction', 'agents', 'authentication'. Do NOT prefix with '/docs/'.",
				inputSchema: z.object({
					path: z
						.string()
						.describe(
							"Page slug (e.g. 'introduction', 'agents', 'servers')",
						),
				}),
				execute: async ({ path }) => {
					const slugs = path.replace(/^\/?(docs\/)?/, "").split("/");
					const page = source.getPage(slugs);

					if (page) {
						return await page.data.getText("processed");
					}

					// Fallback: spec content
					if (
						path.includes("spec") ||
						path.includes("v1.0") ||
						path.includes("specification")
					) {
						const { content } = getSpecContent();
						return content.slice(0, 12000);
					}

					return `Page not found: ${path}`;
				},
			},
		},
		system: systemPrompt,
		messages: await convertToModelMessages(messages ?? []),
		toolChoice: "auto",
	});

	return result.toUIMessageStreamResponse();
}
