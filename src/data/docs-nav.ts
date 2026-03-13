export interface SidebarItem {
	label: string;
	href: string;
}

export interface SidebarSection {
	title: string;
	items: SidebarItem[];
}

export const sidebar: SidebarSection[] = [
	{
		title: "Get started",
		items: [
			{ label: "What is Agent Auth?", href: "/docs/introduction" },
			{ label: "Architecture", href: "/docs/architecture" },
		],
	},
	{
		title: "Concepts",
		items: [
			{ label: "Servers", href: "/docs/servers" },
			{ label: "Client", href: "/docs/client" },
			{ label: "Capabilities", href: "/docs/capabilities" },
			{ label: "Host", href: "/docs/host" },
			{ label: "Agents", href: "/docs/agents" },
			{ label: "Discovery", href: "/docs/discovery" },
		],
	},
	{
		title: "Develop with Agent Auth",
		items: [
			{ label: "Build a server", href: "/docs/build-server" },
			{ label: "Integrate the client", href: "/docs/integrate-client" },
			{ label: "SDKs", href: "/docs/sdks" },
		],
	},
	{
		title: "Security",
		items: [
			{ label: "Security considerations", href: "/docs/security" },
		],
	},
];
