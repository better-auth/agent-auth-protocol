import { source } from "@/lib/source";

type RouteParams = {
	slug?: string[];
};

export type DocsNavItem = {
	title: string;
	description?: string;
	href: string;
	icon: string;
};

export type DocsSection = {
	title: string;
	icon: string;
	items: DocsNavItem[];
};

const SPEC_ROOT_SEGMENTS = new Set(["specification", "v1.0-draft"]);

export function isSpecificationSlug(slug?: string[]) {
	return Boolean(slug?.length && SPEC_ROOT_SEGMENTS.has(slug[0] ?? ""));
}

export function getDocsParams(): RouteParams[] {
	const params = source.generateParams() as RouteParams[];
	return params.filter((item) => !isSpecificationSlug(item.slug));
}

const ITEM_ICONS: Record<string, string> = {
	introduction: "file-text",
	servers: "server",
	client: "cable",
	agents: "bot",
	host: "monitor",
	capabilities: "key",
	discovery: "compass",
	authentication: "lock",
	approval: "check-circle",
	"build-server": "wrench",
	"integrate-client": "plug",
	"client-sdk": "code",
	mcp: "cpu",
	cli: "terminal",
	sdks: "package",
	security: "shield",
	errors: "alert-triangle",
	"data-model": "database",
	privacy: "eye-off",
};

function getPageBySlug(slug: string): DocsNavItem | null {
	const page = source.getPage([slug]);
	if (!page) return null;
	return {
		title: page.data.title,
		description: page.data.description,
		href: page.url,
		icon: ITEM_ICONS[slug] ?? "file-text",
	};
}

const SECTION_LAYOUT: { title: string; icon: string; slugs: string[] }[] = [
	{
		title: "Get Started",
		icon: "play",
		slugs: ["introduction"],
	},
	{
		title: "Learn",
		icon: "blocks",
		slugs: [
			"servers",
			"client",
			"agents",
			"host",
			"capabilities",
			"discovery",
			"authentication",
			"approval",
		],
	},
	{
		title: "Build",
		icon: "hammer",
		slugs: ["build-server", "integrate-client"],
	},
	{
		title: "Clients",
		icon: "terminal",
		slugs: ["client-sdk", "mcp", "cli"],
	},
	{
		title: "Reference",
		icon: "book",
		slugs: ["sdks", "security", "errors", "data-model", "privacy"],
	},
];

export function getDocsSections(): DocsSection[] {
	return SECTION_LAYOUT.map((section) => ({
		title: section.title,
		icon: section.icon,
		items: section.slugs
			.map(getPageBySlug)
			.filter((item): item is DocsNavItem => item !== null),
	}));
}

export function getDocsNavItems(): DocsNavItem[] {
	return getDocsSections().flatMap((section) => section.items);
}
