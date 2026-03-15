import { source } from "@/lib/source";
import { getSpecVersions } from "@/lib/spec";

export const revalidate = false;

export function GET() {
	const pages = source.getPages();
	const versions = getSpecVersions();

	const lines = [
		"# Agent Auth Protocol",
		"",
		"> An open protocol that gives each AI agent its own cryptographic identity, granted capabilities, and lifecycle. Agents authenticate with short-lived Ed25519-signed JWTs and execute server-defined capabilities.",
		"",
		"## Docs",
		"",
		...pages.map(
			(p) => `- [${p.data.title}](${p.url}): ${p.data.description ?? ""}`,
		),
		"",
		"## Specification",
		"",
		...versions.map((v) => `- [${v}](/specification/${v})`),
	];

	return new Response(lines.join("\n"), {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
}
