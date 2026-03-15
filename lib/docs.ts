import { source } from "@/lib/source";

type RouteParams = {
	slug?: string[];
};

export type DocsNavItem = {
	title: string;
	description?: string;
	href: string;
};

const SPEC_ROOT_SEGMENTS = new Set(["specification", "v1.0-draft"]);

export function isSpecificationSlug(slug?: string[]) {
	return Boolean(slug?.length && SPEC_ROOT_SEGMENTS.has(slug[0] ?? ""));
}

export function getDocsParams(): RouteParams[] {
	const params = source.generateParams() as RouteParams[];
	return params.filter((item) => !isSpecificationSlug(item.slug));
}

export function getDocsNavItems(): DocsNavItem[] {
	return getDocsParams()
		.map((item) => source.getPage(item.slug))
		.filter((page): page is NonNullable<typeof page> => Boolean(page))
		.map((page) => ({
			title: page.url === "/docs" ? "Overview" : page.data.title,
			description: page.data.description,
			href: page.url,
		}))
		.sort((a, b) => {
			if (a.href === "/docs") return -1;
			if (b.href === "/docs") return 1;
			return a.href.localeCompare(b.href);
		});
}
