import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
	title: "Registry — Agent Auth",
	description:
		"Discover services that support Agent Auth, or register your own server.",
};

export default function RegistryPage() {
	return (
		<div className="mx-auto max-w-2xl px-6 py-16 lg:py-24">
			<h1 className="text-3xl font-semibold tracking-tight text-fd-foreground">
				Registry
			</h1>
			<p className="mt-4 text-fd-muted-foreground text-[15px] leading-relaxed max-w-lg">
				An Agent Auth registry is a directory of services that implement the
				Agent Auth protocol. It&apos;s part of the protocol&apos;s{" "}
				<Link
					href="/docs/discovery"
					className="underline underline-offset-2 hover:text-fd-foreground transition-colors"
				>
					discovery mechanism
				</Link>{" "}
				— instead of hardcoding every service endpoint, agents can query a
				registry to find services by intent, capability, or domain.
			</p>
			<p className="mt-3 text-fd-muted-foreground text-[15px] leading-relaxed max-w-lg">
				A registry indexes servers that publish a{" "}
				<code className="text-fd-foreground text-[13px] bg-fd-accent/50 px-1 py-0.5">
					/.well-known/agent-configuration
				</code>{" "}
				endpoint. Agents describe what they need — &quot;I need to send a
				bank transfer&quot; or &quot;I need calendar access&quot; — and the
				registry returns matching services with their capabilities, endpoint
				URLs, and registration requirements.
			</p>
			<p className="mt-3 text-fd-muted-foreground text-[15px] leading-relaxed max-w-lg">
				Anyone can run their own registry. The protocol defines the interface,
				not the operator. Server operators can also register their endpoints
				on any public registry to make them discoverable by agents.
			</p>

			<div className="mt-10 border border-fd-border p-6">
				<p className="text-xs font-medium uppercase tracking-wider text-fd-muted-foreground">
					Public Registry
				</p>
				<p className="mt-2 text-[15px] text-fd-foreground font-medium">
					agent-auth.directory
				</p>
				<p className="mt-1.5 text-[13px] text-fd-muted-foreground leading-relaxed max-w-md">
					We maintain a public, open registry where server operators can
					list their services and agents can discover them. Browse existing
					services or register your own.
				</p>
				<div className="mt-5 flex items-center gap-3">
					<a
						href="https://agent-auth.directory"
						target="_blank"
						rel="noopener noreferrer"
						className="group inline-flex items-center gap-1.5 bg-fd-foreground text-fd-background px-3.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
					>
						Browse registry
						<ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
					</a>
					<a
						href="https://agent-auth.directory"
						target="_blank"
						rel="noopener noreferrer"
						className="group inline-flex items-center gap-1.5 border border-fd-border px-3.5 py-1.5 text-xs font-medium text-fd-muted-foreground transition-colors hover:text-fd-foreground hover:border-fd-foreground/20"
					>
						Add your server
						<ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
					</a>
				</div>
			</div>
		</div>
	);
}
