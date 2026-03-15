import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: "Agent Auth Protocol",
		},
		links: [
			{
				text: "Specification",
				url: "/specification",
			},
		],
	};
}
